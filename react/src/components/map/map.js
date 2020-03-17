import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import mapboxgl from "mapbox-gl";
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import * as layers from './layers.js'
import * as popups from './popups.js';
import { createBoundaryFilter, removeBoundaryFilter } from './boundaryFilters.js';
import { getDataFromKeyword, setSidebarHeaderContext, getBoundingBox, setMapBounding, setMapFilter, getPolygonCrashes, removePolyCRNS  } from '../../redux/reducers/mapReducer.js'
import { munis } from '../search/dropdowns.js'
import './map.css';

class Map extends Component {
    constructor(props) {
        super(props)
        this.state = {
            boundary: null,
            heatZoom: true,
            polygon: false,
            // draw is on local state so that removeBoundary() can access the instance of MapboxDraw to call draw.deleteAll()
            draw: new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    // disable trash because we want the polygons and muni/county boundaries to follow the same flow (i.e. use the 'remove boundary' overlay for both)
                    trash: false
                }
            })
        }
    }
    

    /**********************/
    // Lifecycle Methods //
    /**********************/

    componentDidMount() {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
        
        // initialize the map
        this.map = new mapboxgl.Map({
            container: this.crashMap,
            style: 'mapbox://styles/mapbox/navigation-guidance-night-v2?optimize=true',
            center: [-75.2273, 40.071],
            zoom: 8.2
        })

        // add navigation, draw tool, extent and filter buttons
        const navControl = new mapboxgl.NavigationControl()
        this.map.addControl(navControl)
        this.map.addControl(this.state.draw, 'top-right')

        // add DVRPC regional outlines + crash data heat map
        this.map.on('load', () => {
            this.map.addSource("Boundaries" , {
                type: 'vector',
                url: 'https://tiles.dvrpc.org/data/dvrpc-municipal.json'
            })

            this.map.addSource("Crashes", {
                type: 'vector',
                url: 'https://tiles.dvrpc.org/data/crash.json'
            })

            // add regional boundaries
            this.map.addLayer(layers.countyOutline)

            // add municipal boundaries
            this.map.addLayer(layers.municipalityOutline)
            this.map.addLayer(layers.municipalityFill)

            // add crash data layers
            this.map.addLayer(layers.crashHeat)
            this.map.addLayer(layers.crashCircles)

            // status of the hovered municipality
            let hoveredMuni = null
            
            // add hover effect to municipalities
            this.map.on('mousemove', 'municipality-fill', e => hoveredMuni = this.hoverMuniFill(e, hoveredMuni))
            this.map.on('mouseleave', 'municipality-fill', () => hoveredMuni = this.removeMuniFill(hoveredMuni))

            // clicking a municipality triggers the same set of actions as searching by muni
            this.map.on('click', 'municipality-fill', e => this.clickMuni(e))
            
            // update legend depending on zoom level (heatmap vs crash circles). use state.heatZoom state to avoid repainting if the user stays within the circle or heatmap zoom ranges
            this.map.on('zoomend', () => {
                const zoom = this.map.getZoom()

                if(zoom >= 11 && this.state.heatZoom) {
                    this.legendTitle.textContent = 'Crash Severity'
                    this.legendGradient.style.background = 'linear-gradient(to right, #f7f7f7 1%, #4ba3c3, #6eb5cf, #93c7db, #e67e88, #de5260, #d62839)'
                    this.legendLabel.innerHTML = '<span>No Injury</span><span>Fatal</span>'
                    this.setState({heatZoom: false})
                }

                // @TODO: add (KSI) or (All) depending on toggle state
                if(zoom < 11 && !this.state.heatZoom){
                    this.legendTitle.textContent = 'Number of Crashes'
                    this.legendGradient.style.background = 'linear-gradient(to right, #f8eeed, #f9dad7, #f7b9b3, #f39993, #d62839)'
                    this.legendLabel.innerHTML = '<span>1</span><span>4</span><span>8+</span>'
                    this.setState({heatZoom: true})
                }
            })

            // hovering over a circle changes pointer & bumps the radius to let users know they're interactive
            this.map.on('mousemove', 'crash-circles', () => {
                this.map.getCanvas().style.cursor = 'pointer'
            })
            this.map.on('mouseleave', 'crash-circles', () => {
                this.map.getCanvas().style = ''
            })

            // clicking a circle creates a popup w/basic information
            this.map.on('click', 'crash-circles', e => {
                const features = e.features

                // extract array of crn and severity for all crashes at that clicked point
                const crnArray = features.map(crash => { return {crn: crash.properties.id, severity: crash.properties.max_sever} })
                let index = 0

                // initialize the mapbox popup object
                const popup = new mapboxgl.Popup({
                    closebutton: true,
                    closeOnClick: true
                }).setLngLat(e.lngLat)

                // create popup and handle pagination if necessary
                this.handlePopup(crnArray, index, popup)
            })
        })

        // Drawing Events
        // mutes other map other event listeners when the polygon draw tool is selected (shorts out when user finishes drawing b/c that also calls this function)
        this.map.on('draw.modechange', e => e.mode !== 'draw_polygon' ? null : this.setState({polygon: true}))

        // this fires after the polygon is done (i.e. double click to close polygon)
        this.map.on('draw.create', e => {
            const bbox = e.features[0].geometry.coordinates[0]
            this.props.setSidebarHeaderContext('Selected Area')
            this.handleBbox(bbox)
            this.showBoundaryOverlay()
        })

        // this fires when the polygon updates (for our use case, if it's moved via dragging)
        this.map.on('draw.update', e => {
            const bbox = e.features[0].geometry.coordinates[0]
            this.props.setSidebarHeaderContext('Selected Area')
            this.handleBbox(bbox)
        })
    }

    componentDidUpdate(prevProps) {
        // receive crashType from sidebar and set new filter with it
        if(this.props.crashType != prevProps.crashType) {
            const hasBoundary = this.state.boundary
            const crashType = this.props.crashType
            
            if(hasBoundary) {
                hasBoundary.filterType = crashType
                this.props.setMapFilter(hasBoundary)
            }else{
                let filterObj = crashType === 'all' ? {filterType: 'all no boundary'} : {filterType: 'ksi no boundary'}
                this.props.setMapFilter(filterObj)
            }
        }

        // update map filter if necessary
        if(this.props.filter && this.props.filter !== prevProps.filter){
            let filter = this.props.filter === 'none' ? null : this.props.filter

            this.map.setFilter('crash-circles', filter)
            this.map.setFilter('crash-heat', filter)
        }

        // add boundaries and their corresponding filters/styles/sidebar stats
        if(this.props.bounding !== prevProps.bounding) {
            const boundingObj = this.props.bounding
            this.setBoundary(boundingObj)
            this.showBoundaryOverlay()

            // update map filter & circle toggle state when coming from search
            if(boundingObj.filter) {
                const toggleFilter = boundingObj.filter
                toggleFilter.filterType = this.props.crashType || 'ksi'

                this.props.setMapFilter(toggleFilter)
                this.setState({boundary: toggleFilter})
            }
        }

        // apply polygon filter
        if(this.props.polyCRNS) {  
            const toggleState = this.props.crashType || 'ksi'
            let filter;

            if(toggleState === 'ksi'){
                filter = ['all', 
                    ['in', 'id', ...this.props.polyCRNS],
                    ['>', 'max_sever', 0],
                    ['<', 'max_sever', 3]
                ]
            } else{
                filter = ['match', ['get', 'id'], this.props.polyCRNS, true, false]
            }            

            this.map.setFilter('crash-circles', filter)
            this.map.setFilter('crash-heat', filter)
        }

        // zoom to a new center when appropriate (address searches)
        if(prevProps.center !== this.props.center) {
            this.map.flyTo({
                center: this.props.center,
                zoom: 12,
                speed: 0.9,
                curve: 1.7
            })
        }

        // zoom to a bounding box when appropriate (all non-address searches)
        if(this.props.bbox && prevProps.bbox !== this.props.bbox) {
            this.map.fitBounds(this.props.bbox)
        }
    }

    componentWillUnmount() {
        this.map.remove()
    }

    
    /*****************/
    // Class Methods //
    /*****************/

    // reset map to default view
    resetControl = () => this.map.flyTo({center: [-75.2273, 40.071], zoom: 8.2})

    // reveal the list of layer toggles (right now it's just crash circle type)
    toggleLayerToggles = e => {
        const wrapper = e.target

        // handle event bubbling
        if(wrapper.id !== 'toggle-wrapper') return

        const children = wrapper.children
        const length = children.length
        
        for(var i = 0; i < length; i++){
            children[i].classList.toggle('hidden')
        }
    }

    // reveal the boundary overlay when a boundary is established
    showBoundaryOverlay = () => this.boundaryOverlay.classList.remove('hidden')

    // apply boundary filters and map styles
    setBoundary = boundaryObj => {
        
        // testing polygon
        // @TODO: remove?
        if(this.state.polygon){
            console.log('boundary object is ', boundaryObj)
            return
        }
        
        // derive layer styles from boundaryObj
        const { baseFilter, resetFilter} = createBoundaryFilter(boundaryObj)

        // set the appropriate filters
        this.map.setFilter(baseFilter.layer, baseFilter.filter)
        this.map.setFilter(resetFilter.layer, resetFilter.filter)
        
        // make the appropraite paint changes
        this.map.setPaintProperty(baseFilter.layer, 'line-width', 4)
        this.map.setPaintProperty(baseFilter.layer, 'line-color', '#f7c59f')
        this.map.setPaintProperty(resetFilter.layer, 'line-width', resetFilter.width)
        this.map.setPaintProperty(resetFilter.layer, 'line-color', resetFilter.color)
    }

    // hide the boundary overlay and reset map filters, styles and sidebar info to default
    removeBoundary = () => {
        // toggle overlay visibility
        this.boundaryOverlay.classList.add('hidden')

        // remove any existing polygons & empty polyCRNS state object
        if(this.state.polygon){
            this.state.draw.deleteAll()
            this.props.removePolyCRNS()
        }

        // update sidebar information
        const regionalStats = {type: 'municipality', name: '%'}
        this.props.setDefaultState(regionalStats)
        this.props.setSidebarHeaderContext('the DVRPC region')

        // update map filters and paint properties
        const { county, muni } = removeBoundaryFilter()

        // remove filter while maintaining crash type filter (all or ksi)
        let newFilterType = this.props.crashType === 'all' ? 'all no boundary' : 'ksi no boundary'
        const filterObj = {filterType: newFilterType}

        // set store filter state
        this.props.setMapFilter(filterObj)
        this.map.setFilter(county.layer, county.filter)
        this.map.setFilter(muni.layer, muni.filter)

        this.map.setPaintProperty(county.layer, 'line-width', county.paint.width)
        this.map.setPaintProperty(county.layer, 'line-color', county.paint.color)
        this.map.setPaintProperty(muni.layer, 'line-width', muni.paint.width)
        this.map.setPaintProperty(muni.layer, 'line-color', muni.paint.color)

        // update boundary state to allow hover effects now that boundaries are removed & update polygon state to enable normal event listener interaction
        this.setState({
            boundary: null,
            polygon: false
        })
    }

    // add fill effect when hovering over a municipality
    hoverMuniFill = (e, hoveredMuni) => {

        // escape if zoom level isn't right, if a boundary is set or if the user is drawing a polygon
        if(this.map.getZoom() < 8.4 || this.state.boundary || this.state.polygon) return

        this.map.getCanvas().style.cursor = 'pointer'

        if(e.features.length > 0 ) {
            
            // // update old hover jawn
            if(hoveredMuni) {
                this.map.setFeatureState(
                    {source: 'Boundaries', sourceLayer: 'municipalities', id: hoveredMuni},
                    {hover: false}
                )
            }

            hoveredMuni = +e.features[0].id
            
            // handle edge cases where hoveredMuni is null or NaN (I think this check is only necessary right now b/c it sometimes serves the old VT's and sometimes doesn't. Can be removed eventually)
            if(hoveredMuni) {
                this.map.setFeatureState(
                    {source: 'Boundaries', sourceLayer: 'municipalities', id: hoveredMuni},
                    {hover: true}
                )
            }
        }

        return hoveredMuni
    }

    // remove fill effect when hovering over a new municipality or leaving the region
    removeMuniFill = hoveredMuni => {

        // escape if zoom level isn't right
        if(this.map.getZoom() < 8.4) return

        this.map.getCanvas().style.cursor = ''

        // handle municipality-fill (fill effect within munis) and municipalities (edge cases - moving your mouse outside the region or on borders)
        if(hoveredMuni) {
            this.map.setFeatureState({source: 'Boundaries', sourceLayer: 'municipality-fill', id: hoveredMuni},
            {hover: false})

            this.map.setFeatureState({source: 'Boundaries', sourceLayer: 'municipalities', id: hoveredMuni},
            {hover: false})
        }

        hoveredMuni = null

        return hoveredMuni
    }

    // draw a boundary, zoom to, filter crash data and update sidebar on muni click
    clickMuni = e => {

        // short out if the user is drawing polygons
        if(this.state.polygon) return

        // short out if a user clicks on a crash circle
        const circleTest = this.map.queryRenderedFeatures(e.point)[0]
        if(circleTest.source === 'Crashes') return

        const props = e.features[0].properties
        const id = props.geoid
        const encodedName = encodeURIComponent(props.name)
        const featureId = e.features[0].id
        const boundaryObj = {type: 'municipality', name: encodedName}

        // update filter object w/muni id + toggle state
        let pennID = munis[props.name]
        let newFilterType = this.props.crashType || 'ksi'
        const filterObj = {filterType: newFilterType, tileType: 'm', id: pennID}

        // do all the things that search does
        this.props.setSidebarHeaderContext(props.name)
        this.props.getData(boundaryObj)
        this.props.setMapBounding(boundaryObj)
        this.props.getBoundingBox(id)
        this.props.setMapFilter(filterObj)

        // set bounding filters
        this.setBoundary(boundaryObj)
        this.showBoundaryOverlay()

        // use featureId to remove the muni fill that hovering created
        this.removeMuniFill(featureId)

        // update boundary state to prevent hover effects when boundaries are present & so the ksi/all toggle can stay within the set bounds
        this.setState({boundary: filterObj})
    }

    // create bbox object from polygon & hit endpoints w/it
    handleBbox = bbox => {
        const bboxFormatted = encodeURIComponent(JSON.stringify(
            {
                "type":"Polygon",
                "coordinates": [bbox],
                "crs": {
                    "type": "name",
                    "properties": {
                        "name": "EPSG:4326"
                    }
                }
            }
        ))

        // create boundary object for the getData endpoint
        const boundaryObj = {
            type: 'geojson',
            name: bboxFormatted
        }

        this.props.getPolygonCrashes(bboxFormatted)
        this.props.getData(boundaryObj)
    }

    // handle popup creation and pagination
    handlePopup = async (crnArray, index, popup) => {
        const length = crnArray.length
        const popupInfo = popups.getPopupInfo(crnArray[index])

        const html = await popupInfo.then(result => {
            const current = index + 1

            // create popup content (success or fail)
            if(result.fail){
                return popups.catchPopupFail(result.crn)
            }else{
                return popups.setPopup(result, current, length)
            }
        })

        // set popup
        popup.setHTML(html).addTo(this.map)

        // handle pagination if necessary
        if (length > 1) {
            let nextPopup, previousPopup

            // get a handle on the buttons
            const node = ReactDOM.findDOMNode(this)
            if (node instanceof HTMLElement) {
                const wrapper = node.querySelector('.mapboxgl-popup')
                nextPopup = wrapper.querySelector('#crash-next-popup')
                previousPopup = wrapper.querySelector('#crash-previous-popup')
            } else{
                console.log('pagination function failed to find map node')
                return
            }

            // add next click handler
            nextPopup.onclick = () => {
                index + 1 >= length ? index = 0 : index += 1
                this.handlePopup(crnArray, index, popup)
            }

            // add previous click handler
            previousPopup.onclick = () => {
                index - 1 < 0 ? index = length - 1 : index -= 1
                this.handlePopup(crnArray, index, popup)
            }
        }
    }


    render() {
        return (
            <main id="crashMap" ref={el => this.crashMap = el}>
                <div id="legend" className="shadow overlays">
                    <h3 className="legend-header centered-text" ref={el => this.legendTitle = el}>Number of Crashes</h3>
                    <span id="legend-gradient" ref={el => this.legendGradient = el}></span>
                    <div id="legend-text" ref={el => this.legendLabel = el}>
                        <span>1</span>
                        <span>4</span>
                        <span>8+</span>
                    </div>
                </div>

                <div id="default-extent-btn" className="shadow overlays custom-toggle" aria-label="Default DVRPC Extent" onClick={this.resetControl}>
                    <img id="default-extent-img" src='https://www.dvrpc.org/img/banner/new/bug-favicon.png' alt='DVRPC logo' />
                </div>

                <button type="button" id="remove-boundary-btn" className="shadow overlays hidden" aria-label="remove boundary" aria-hidden="true" ref={el => this.boundaryOverlay = el} onClick={this.removeBoundary}>
                    remove boundary <span id="remove-boundary-x">x</span> 
                </button>
            </main>
        );
    }
}

const mapStateToProps = state => {
    return {
        center: state.center,
        crashType: state.crashType,
        range: state.range,
        bounding: state.bounding,
        bbox: state.bbox,
        filter: state.filter,
        polyCRNS: state.polyCRNS
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getData: boundaryObj => dispatch(getDataFromKeyword(boundaryObj)),
        setMapBounding: boundingObj => dispatch(setMapBounding(boundingObj)),
        setSidebarHeaderContext: area => dispatch(setSidebarHeaderContext(area)),
        getBoundingBox: id => dispatch(getBoundingBox(id)),
        setDefaultState: region => dispatch(getDataFromKeyword(region)),
        setMapFilter: filter => dispatch(setMapFilter(filter)),
        getPolygonCrashes: bbox => dispatch(getPolygonCrashes(bbox)),
        removePolyCRNS: () => dispatch(removePolyCRNS())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);