import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import mapboxgl from "mapbox-gl";
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import * as layers from './layers.js'
import * as popups from './popups.js';
import { createBoundaryHighlight, removeBoundaryFilter } from './boundaryFilters.js';
import { getDataFromKeyword, setSidebarHeaderContext, getBoundingBox, setMapBounding, setMapFilter, getPolygonCrashes, setPolygonBbox, removePolyCRNS  } from '../../redux/reducers/mapReducer.js'
import './map.css';

class Map extends Component {
    constructor(props) {
        super(props)
        this.state = {
            boundary: null,
            polygon: false,
            popup: false,
            // draw is on local state so that removeBoundary() can access the instance of MapboxDraw to call draw.deleteAll()
            draw: new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    // disable trash because we want the polygons and muni/county boundaries to follow the same flow (i.e. use the 'remove boundary' overlay for both)
                    trash: false
                }
            }),
            zoom: window.innerWidth <= 420 ? 7.3 : 8.3
        }
    }
    

    /**********************/
    // Lifecycle Methods //
    /**********************/
    componentDidMount() {
        // mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
        mapboxgl.accessToken = 'pk.eyJ1IjoibW1vbHRhIiwiYSI6ImNqZDBkMDZhYjJ6YzczNHJ4cno5eTcydnMifQ.RJNJ7s7hBfrJITOBZBdcOA'
        
        // @NOTE: do not delete this comment:
        // eslint-disable-next-line import/no-webpack-loader-syntax
        mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default //fix bable transpiling issues
        
        const longitudeOffset = window.innerWidth > 800 ? -75.83 : -75.2273
        
        // initialize the map
        this.map = new mapboxgl.Map({
            container: this.crashMap,
            // style: 'mapbox://styles/mapbox/navigation-day-v1',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [longitudeOffset, 40.071],
            zoom: this.state.zoom,
            //@Note: this is a performance hit but necessary to export the map canvas for printing
            preserveDrawingBuffer: true
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
                url: 'https://tiles.dvrpc.org/data/crash.json',
                promoteId: 'id'
            })

            this.map.addSource("PPA", {
                type: 'geojson',
                data: 'https://arcgis.dvrpc.org/portal/rest/services/Boundaries/DVRPC_MCD_PhiCPA/FeatureServer/0/query?where=co_name%3D%27Philadelphia%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=geoid&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson'
            })

            // Find the index of the first symbol layer in the map style. (from mapbox docs)
            const mapLayers = this.map.getStyle().layers;
            let firstSymbolId;

            for (const layer of mapLayers) {
                if (layer.type === 'symbol') {
                    firstSymbolId = layer.id;
                    break;
                }
            }

            // add county boundaries beneath road labels in streets v-12 spec
            this.map.addLayer(layers.countyOutline, 'settlement-subdivision-label')
            this.map.addLayer(layers.countyFill, firstSymbolId)

            // add municipal boundaries beneath road labels in streets-v12 spec
            this.map.addLayer(layers.municipalityOutline, 'settlement-subdivision-label')
            this.map.addLayer(layers.municipalityFill, firstSymbolId)

            // add PPA's
            this.map.addLayer(layers.phillyOutline, 'settlement-subdivision-label')

            // add crash data layers beneath relevant layers in streets-v12 spec
            this.map.addLayer(layers.crashHeat, 'settlement-subdivision-label')
            this.map.addLayer(layers.crashCircles, 'settlement-subdivision-label')
        })

        // variables for hover state
        let hoveredGeom = null
        let hoveredCircle = null
        
        // add hover effect to geographies
        this.map.on('mousemove', 'municipality-fill', e => hoveredGeom = this.hoverGeographyFill(e, hoveredGeom))
        this.map.on('mouseleave', 'municipality-fill', () => hoveredGeom = this.removeGeographyFill(hoveredGeom))
        this.map.on('mousemove', 'county-fill', e => hoveredGeom = this.hoverGeographyFill(e, hoveredGeom))
        this.map.on('mouseleave', 'county-fill', () => hoveredGeom = this.removeGeographyFill(hoveredGeom))

        // handle click events
        this.map.on('click', 'municipality-fill', e => this.clickGeography(e))
        this.map.on('click', 'county-fill', e => this.clickGeography(e))
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

            // put popup state on local state
            this.setState({popup: popup})
        })
        
        // update legend depending on zoom level (heatmap vs crash circles)
        this.map.on('zoomend', () => this.updateLegend())

        this.map.on('mousemove', 'crash-circles', e => {
            this.map.getCanvas().style.cursor = 'pointer'

            if(hoveredCircle){
                this.map.setFeatureState(
                    {
                        source: 'Crashes',
                        sourceLayer: 'crash',
                        id: hoveredCircle
                    },
                    {
                        hover: false
                    }
                )
            }
            
            hoveredCircle = e.features[0].id
            
            this.map.setFeatureState(
                {
                    source: 'Crashes',
                    sourceLayer: 'crash',
                    id: hoveredCircle
                },
                {
                    hover: true
                }
            )
        })

        this.map.on('mouseleave', 'crash-circles', () => {
            if (hoveredCircle) {
                this.map.setFeatureState(
                    {
                        source: 'Crashes',
                        sourceLayer: 'crash',
                        id: hoveredCircle
                    },
                    {
                        hover: false
                    }
            )}
            
            hoveredCircle = null;

            this.map.getCanvas().style.cursor = ''
        })

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
        // set form filters (crash type and range) to prevProps or default value to hold on to state if a recalculation doesn't occur
        const prevType = prevProps.crashType || 'KSI'
        const prevRange = prevProps.range || {}
        let makeNewFilter = false

        const filterObj = {
            filterType: prevType,
            boundary: false,
            tileType: '',
            id: 0,
            range: prevRange
        }

        // add crashType filters & update legend
        if(this.props.crashType !== prevProps.crashType) {
            const crashType = this.props.crashType
            filterObj.filterType = crashType
            makeNewFilter = true
            this.updateLegend()
        }

        // add range filters
        if(this.props.range){
            const {to, from} = this.props.range

            // set range if first time or new range
            if(prevProps.range){
                const prevRange = prevProps.range
                const prevFrom = prevRange.from
                const prevTo = prevRange.to

                if(prevTo !== to || prevFrom !== from) {
                    filterObj.range = {to, from}
                    makeNewFilter = true
                }
            } else{
                filterObj.range = {to, from}
                makeNewFilter = true
            }
        }

        // update store filters
        if(makeNewFilter) {
            if(this.state.boundary) {
                const boundary = this.state.boundary
                filterObj.id = boundary.id
                filterObj.tileType = boundary.tileType
                filterObj.boundary = true
            }
            this.props.setMapFilter(filterObj)
        }

        // apply filters
        if(this.props.filter){
            let filter = this.props.filter === 'none' ? null : this.props.filter

            this.map.setFilter('crash-circles', filter)
            this.map.setFilter('crash-heat', filter)
        }

        // add boundaries and their corresponding filters/styles/sidebar stats
        if(this.props.bounding !== prevProps.bounding) {
            const { county, muni, philly } = removeBoundaryFilter()

            this.map.setFilter(county.layer, county.filter)
            this.map.setFilter(muni.layer, muni.filter)
            this.map.setFilter(philly.layer, philly.filter)

            this.map.setPaintProperty(county.layer, 'line-width', county.paint.width)
            this.map.setPaintProperty(county.layer, 'line-color', county.paint.color)
            this.map.setPaintProperty(muni.layer, 'line-width', muni.paint.width)
            this.map.setPaintProperty(muni.layer, 'line-color', muni.paint.color)
            this.map.setPaintProperty(philly.layer, 'line-width', philly.paint.width)
            this.map.setPaintProperty(philly.layer, 'line-color', philly.paint.color)

            // create new filter
            const boundingObj = this.props.bounding

            this.setBoundary(boundingObj)
            this.showBoundaryOverlay()

            // update map filter & circle toggle state when coming from search
            if(boundingObj.filter) {
                const toggleFilter = boundingObj.filter
                this.props.setMapFilter(toggleFilter)
                this.setState({boundary: toggleFilter})
            }
        }

        // apply polygon filter (special case)
        if(this.props.polyCRNS) {
            const fail = this.props.polyCRNS.message
            let crashType = this.props.crashType || 'KSI'
            let range = this.props.range
            let polygonFilter = fail ? ['all', ['in', 'id', '' ]] : ['all', ['in', 'id', ...this.props.polyCRNS]]

            // add range
            if(range) {
                const {from, to} = range
                const rangeFilter = [
                    ['>=', 'year', parseInt(from)],
                    ['<=', 'year', parseInt(to)]            
                ]
                polygonFilter = polygonFilter.concat(rangeFilter)
            }

            // add crashtype
            if(crashType === 'KSI') {
                const ksiFilter = [
                    ['>', 'max_sever', -1],
                    ['<', 'max_sever', 2],
                ]
                polygonFilter = polygonFilter.concat(ksiFilter)
            }
            
            this.map.setFilter('crash-circles', polygonFilter)
            this.map.setFilter('crash-heat', polygonFilter)
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
            if( window.innerWidth > 800 ) {
                // handle desktop offset
                const leftPad = (window.innerWidth * 0.33 + 10)
                const padding = {top: 0, bottom: 0, left: leftPad, right: 0}

                this.map.fitBounds(this.props.bbox, {padding})
            } else {
                this.map.fitBounds(this.props.bbox)
            }
        }
    }

    componentWillUnmount() {
        this.map.remove()
    }

    
    /*****************/
    // Class Methods //
    /*****************/
    // reset map to default view
    resetControl = () => {
        const longitudeOffset = window.innerWidth > 800 ? -75.85 : -75.2273
        this.map.flyTo({center: [longitudeOffset, 40.071], zoom: this.state.zoom, pitch: 0})
    }

    // reveal the boundary overlay when a boundary is established
    showBoundaryOverlay = () => this.boundaryOverlay.classList.remove('hidden')

    // apply boundary filters and map styles
    setBoundary = boundaryObj => {
        
        // derive layer styles from boundaryObj
        const highlight = createBoundaryHighlight(boundaryObj)
        
        // make the appropraite paint changes
        this.map.setPaintProperty(highlight.layer, 'line-width', highlight.width)
        this.map.setPaintProperty(highlight.layer, 'line-color', highlight.color)

        // remove any existing polygons
        if(this.state.polygon){
            this.state.draw.deleteAll()
            this.props.removePolyCRNS()
            this.setState( { polygon: false })
        }
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
        let newFilterType = this.props.crashType || 'KSI'
        let isKSI = newFilterType === 'KSI' ? 'yes' : 'no'

        const regionalStats = {geoID: '', isKSI}
        this.props.setDefaultState(regionalStats)
        this.props.setSidebarHeaderContext('the DVRPC region')

        // get default map filters and paint properties
        const { county, muni, philly } = removeBoundaryFilter()

        // remove filter while maintaining crash type filter (all or ksi)
        let range = this.props.range || {}
        const filterObj = {filterType: newFilterType, range}

        // set store filter state
        // @UPDATe DONT touch this
        this.props.setMapFilter(filterObj)

        // update map
        // @UPDATE remove map style filtering, just reset to default paint values
        this.map.setFilter(county.layer, county.filter)
        this.map.setFilter(muni.layer, muni.filter)
        this.map.setFilter(philly.layer, philly.filter)

        this.map.setPaintProperty(county.layer, 'line-width', county.paint.width)
        this.map.setPaintProperty(county.layer, 'line-color', county.paint.color)
        this.map.setPaintProperty(muni.layer, 'line-width', muni.paint.width)
        this.map.setPaintProperty(muni.layer, 'line-color', muni.paint.color)
        this.map.setPaintProperty(philly.layer, 'line-width', philly.paint.width)
        this.map.setPaintProperty(philly.layer, 'line-color', philly.paint.color)
        
        // update boundary state to allow hover effects now that boundaries are removed & update polygon state to enable normal event listener interaction
        this.setState({
            boundary: null,
            polygon: false
        })
    }

    // add fill effect when hovering over a geography type (county or municipality)
    hoverGeographyFill = (e, hoveredGeom) => {

        // escape if a boundary is set or if the user is drawing a polygon
        if(this.state.boundary || this.state.polygon) return

        let sourceLayer = this.map.getZoom() < 8.4 ? 'county' : 'municipalities'
        let features = e.features

        if(features.length > 0 ) {
            features = features[0]
            const name =  sourceLayer === 'county' ? features.properties.name + ' County' : features.properties.name
            // remove old hover state
            if(hoveredGeom) {
                this.map.setFeatureState(
                    {source: 'Boundaries', sourceLayer, id: hoveredGeom},
                    {hover: false}
                )
            }

            // update hover layer
            hoveredGeom = features.id
            
            // handle edge cases where hoveredGeom is null or NaN (I think this check is only necessary right now b/c it sometimes serves the old VT's and sometimes doesn't. Can be removed eventually)
            if(hoveredGeom) {
                this.map.setFeatureState(
                    {source: 'Boundaries', sourceLayer, id: hoveredGeom},
                    {hover: true}
                )
            }

            // update the overlay text (and visibility if necessary)
            this.hoveredArea.style.visibility = 'visible'
            this.hoveredArea.children[0].textContent = name
        }

        return hoveredGeom
    }

    // remove fill effect when hovering over a new municipality or leaving the region
    removeGeographyFill = hoveredGeom => {

        // escape if zoom level isn't right @TODO make this a county or zoom level decision
        let sourceLayer = this.map.getZoom() < 8.4 ? 'county' : 'municipalities'

        if(hoveredGeom) {
            this.map.setFeatureState({source: 'Boundaries', sourceLayer: `${sourceLayer}-fill`, id: hoveredGeom},
            {hover: false})

            this.map.setFeatureState({source: 'Boundaries', sourceLayer, id: hoveredGeom},
            {hover: false})

            this.hoveredArea.style.visibility = 'hidden'
        }

        hoveredGeom = null

        return hoveredGeom
    }

    // draw a boundary, zoom to, filter crash data and update sidebar on muni click
    clickGeography = e => {        
        // exit if an active geom exists
        if(this.state.polygon || this.state.boundary) return

        // exit & update state if popup exists b/c this will also close the popup
        if(this.state.popup) {
            this.setState({popup: false})
            return
        }
        
        // short out if a user clicks on a crash circle 
        const circleTest = this.map.queryRenderedFeatures(e.point)[0]
        if(circleTest.source === 'Crashes') return
        
        // get source layer and exit if the wrong one is triggered
        let sourceLayer = this.map.getZoom() < 8.4 ? 'county' : 'municipality'
        const features = e.features[0]
        if(sourceLayer[0] !== features.sourceLayer[0]) return
        
        // get feature properties
        const props = features.properties
        const name = props.name
        const featureID = features.id
        let geoID = features.properties.geoid

        // get KSI and range state from store
        const range = this.props.range || {}
        const newFilterType = this.props.crashType || 'KSI'
        let isKSI = newFilterType === 'KSI' ? 'yes' : 'no'

        // set layer-dependent variables
        let tileType;
        let countyName;
        if(sourceLayer === 'county'){
            tileType = 'c'
            countyName = `${name} County`
        }else {
            tileType = 'm'
        }

        // handle philly edge case
        const phillyTest = name.substring(0, 5)
        if(phillyTest === 'Phila') {
            geoID = 42101
            tileType = 'c'
            sourceLayer = 'county'
        }
        
        // create data, filter and boundary objects
        const dataObj = { geoID, isKSI }
        const boundaryObj = { type: sourceLayer, id: geoID }
        const filterObj = {filterType: newFilterType, tileType, id: geoID, range, boundary: true}

        // dispatch actions to: set sidebar header, fetch the data and create a bounding box for the selected area
        this.props.setSidebarHeaderContext(countyName || name)
        this.props.getData(dataObj)
        this.props.setMapBounding(boundaryObj)
        this.props.getBoundingBox(geoID)
        this.props.setMapFilter(filterObj)

        // use featureID to remove the muni fill that hovering created
        this.removeGeographyFill(featureID)

        // hide the hover boundary
        this.hoveredArea.style.visibility = 'hidden'

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
        
        let typeCheck = this.props.crashType || 'KSI'
        let isKSI = typeCheck === 'KSI' ? 'yes' : 'no'

        // create data object for API call
        const dataObj = {
            geojson: bboxFormatted,
            isKSI
        }

        // update store w/bbox info
        this.props.getPolygonCrashes(bboxFormatted)
        this.props.getData(dataObj)
        this.props.setPolygonBbox(bboxFormatted)
    }

    // handle popup creation and pagination
    handlePopup = async (crnArray, index, popup) => {
        const length = crnArray.length
        const popupInfo = popups.getPopupInfo(crnArray[index])

        const html = await popupInfo.then(result => {
            const current = index + 1

            // create popup content (success or fail)
            if(result.fail){
                // remove the state code from the CRN for printing
                const crnOutput = result.crn.substring(2)
                return popups.catchPopupFail(crnOutput)
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

    updateLegend = () => {
        const zoom = this.map.getZoom()

        if(zoom >= 11) {
            this.legendTitle.textContent = 'Crash Severity'

            if(!this.props.crashType || this.props.crashType === 'KSI') {
                this.legendGradient.style.background = 'linear-gradient(to right, #e67e88, #de5260, #c12433)'
                this.legendLabel.innerHTML = '<span>Severe Injury</span><span>Fatal</span>'

            }else {
                this.legendGradient.style.background = 'linear-gradient(to right, #f7f7f7, #93c7db, #6eb5cf, #4ba3c3, #e67e88, #de5260, #c12433)'
                this.legendLabel.innerHTML = '<span>No Injury</span><span>Fatal</span>'
            }

        } else {
            let crashType = this.props.crashType || 'KSI'
            this.legendTitle.textContent = `Number of Crashes (${crashType})`
            this.legendGradient.style.background = 'linear-gradient(to right, #feebe2, #fcc5c0, #c51b8a, #7a0177)'
            this.legendLabel.innerHTML = '<span>1</span><span>4</span><span>8+</span>'
        }
    }

    render() {
        let crashType = this.props.crashType || 'KSI'
        
        return (
            <main id="crashMap" className="no-print" ref={el => this.crashMap = el}>
                <div id="legend" className="shadow overlays">
                    <h3 className="legend-header centered-text" ref={el => this.legendTitle = el}>Number of Crashes ({crashType})</h3>
                    <span id="legend-gradient" ref={el => this.legendGradient = el}></span>
                    <div id="legend-text" ref={el => this.legendLabel = el}>
                        <span>1</span>
                        <span>4</span>
                        <span>8+</span>
                    </div>
                </div>

                <div id="hoveredArea" className="shadow overlays" ref={el => this.hoveredArea = el}>
                    <h3>default</h3>
                </div>

                <div id="default-extent-btn" className="shadow overlays" aria-label="Default DVRPC Extent" onClick={this.resetControl} title="Zoom to Region">
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
        getData: dataObj => dispatch(getDataFromKeyword(dataObj)),
        setMapBounding: boundingObj => dispatch(setMapBounding(boundingObj)),
        setSidebarHeaderContext: area => dispatch(setSidebarHeaderContext(area)),
        getBoundingBox: id => dispatch(getBoundingBox(id)),
        setDefaultState: region => dispatch(getDataFromKeyword(region)),
        setMapFilter: filter => dispatch(setMapFilter(filter)),
        getPolygonCrashes: bbox => dispatch(getPolygonCrashes(bbox)),
        setPolygonBbox: formattedBbox => dispatch(setPolygonBbox(formattedBbox)),
        removePolyCRNS: () => dispatch(removePolyCRNS())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);