import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactPaginate from 'react-paginate';
import { connect } from 'react-redux'
import mapboxgl from "mapbox-gl";

import * as layers from './layers.js'
import * as popups from './popups.js';
import { createBoundaryFilter, removeBoundaryFilter } from './boundaryFilters.js';
import { getDataFromKeyword, setSidebarHeaderContext, getBoundingBox, setMapBounding, setMapFilter  } from '../../redux/reducers/mapReducer.js'
import { munis } from '../search/dropdowns.js'
import './map.css';

class Map extends Component {
    constructor(props) {
        super(props)
        this.state = {
            boundary: null,
            heatZoom: true,
        }
    }

    componentDidMount() {

        // test the map filter reducer
        const testFilter = {
            filterType: 'default'
        }
        this.props.setMapFilter(testFilter)

        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
        
        this.map = new mapboxgl.Map({
            container: this.crashMap,
            style: 'mapbox://styles/mapbox/dark-v9',
            center: [-75.2273, 40.071],
            zoom: 8.2
        })

        // add navigation + custom return to default button
        const navControl = new mapboxgl.NavigationControl()
        this.map.addControl(navControl)

        // add DVRPC regional outlines + crash data heat map
        this.map.on('load', () => {
            this.map.addSource("Boundaries" , {
                type: 'vector',
                url: 'https://tiles.dvrpc.org/data/dvrpc-municipal.json'
            })

            this.map.addSource("Crashes", {
                type: 'vector',
                url: 'https://tiles.dvrpc.org/data/pa-crash.json'
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

                // initialize the mapbox popup object
                const popup = new mapboxgl.Popup({
                    closebutton: true,
                    closeOnClick: true
                }).setLngLat(e.lngLat)

                // get info
                const popupInfo = popups.getPopupInfo(crnArray[0])

                popupInfo.then(result => {
                    let html;

                    // create popup content (success or fail)
                    if(result.fail){
                        html = popups.catchPopupFail(result.crn)
                    }else{
                        html = popups.setPopup(result)
                    }

                    // add the popup to the map
                    popup.setHTML(html).addTo(this.map)
                })

                // add pagination if necessary
                if (crnArray.length > 1) {
                                        
                    const paginate = <ReactPaginate
                    previousLabel={'previous'}
                    nextLabel={'next'}
                    breakLabel={'...'}
                    pageCount={crnArray.length}
                    pageRangeDisplayed={5}
                    />
                                        
                    // big issue with this approach
                        // ReactDOM.createPortal needs to be called in the return of a components render method
                        // a potential work around is to create a wrapper component that accepts the popup as props, creates the paginate element and then calls createPortal in the render method, placing <Paginate /> within popup. 
                            // since paginate would exist within another component, the click handlers could also go there. 
                    
                    //ReactDOM.createPortal(paginate, popup)
                }
            })
        })
    }

    componentDidUpdate(prevProps) {

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
        if(prevProps.bbox !== this.props.bbox) {
            this.map.fitBounds(this.props.bbox)
        }

        // add boundaries and their corresponding filters/styles/sidebar stats
        if(this.props.bounding !== prevProps.bounding) {
            const boundingObj = this.props.bounding
            this.setBoundary(boundingObj)
            this.showBoundaryOverlay()
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

    // toggle which circles are on the map (defaults to KSI)
    toggleCircleType = e => {
        const id = e.target.id
        let filter, geoFilter, tileType, geoID;
        const existingFilter = this.state.boundary
        
        if(existingFilter) {
            geoFilter = existingFilter[1]
            tileType = geoFilter[1]
            geoID = geoFilter[2]
        }

        // create a filter based on the selected radio input
        if(id === 'All') {
            filter = geoFilter ? geoFilter : null
        }else {
            if(geoFilter){
                filter = ['all',
                    ['==', tileType, geoID],
                    ['>', 'max_sever', '0'],
                    ['<', 'max_sever', '3'],
                ]
            }else{
                filter = ['any', 
                    ['==', ['get', 'max_sever'], '1'],
                    ['==', ['get', 'max_sever'], '2'],
                ]
            }
        }

        // @TODO: roadmap for filter update is here
        // UPDATE filter state to global
        /*
            The possible filter states are as follows:
                DEFAULT (KSI no boundary):
                    ['any', 
                        ['==', 'max_sever', '1'],
                        ['==', 'max_sever', '2'],
                    ]

                BOUNDARY (KSI):
                    ['all',
                        ['==', tileType, id],
                        ['>', 'max_sever', '0'],
                        ['<', 'max_sever', '3']    
                    ]
                
                BOUNDARY (ALL):
                    ['==', tileType, id]
            

            These filters should exist on global state because the following components need to consume them:
                map
                sidebar
                charts
            The global map filter can exist as one object because circles and heatmaps use the same one - i.e. only need a filterState rather than a heatFilter and crashFilter
            
            The following edits need to be made:
                Edits to boundaryFilters.js:
                    Remove circlesFilter and heatFilter from both setBoundaryFilter and removeBoundaryFilter
                Edits to map.js
                    setBoundary and removeBoundary will only filter the county/municipality lines and will update the store state of map filter
                    toggleCircleType will update the store state of map filter
                    componentDidUpdate will consume the updated filter and then call this.map.setFilter on circles and heatmaps with the response
                Edits to sidebar/charts.js
                    sidebar.js reads circle and heat filter state from the store
                    charts.makeCharts will accept a parameter for circle and heat filters and use that to filter down the outputs
                    sidebar.js intro paragraph <span id="activeCrashTypes"> textContent will update to reflect KSI or All types
                Edits to store/reducer
                    Create a reducer for filter state. Plug it into map.js and sidebar.js
                        map.js will read and write to the filter reducer
                        sidebar.js will only read from the filter reducer
                    Output will be one of the three filter states defined above. 
        */


        // update the crash circle filter
        this.map.setFilter('crash-circles', filter)
    }

    // reveal the boundary overlay when a boundary is established
    showBoundaryOverlay = () => this.boundaryOverlay.classList.remove('hidden')

    // apply boundary filters and map styles
    setBoundary = boundaryObj => {
        
        // derive layer styles from boundaryObj
        const { baseFilter, resetFilter, circlesFilter, heatFilter } = createBoundaryFilter(boundaryObj)

        // set the appropriate filters
        this.map.setFilter(baseFilter.layer, baseFilter.filter)
        this.map.setFilter(resetFilter.layer, resetFilter.filter)
        this.map.setFilter(heatFilter.layer, heatFilter.filter)        
        this.map.setFilter(circlesFilter.layer, circlesFilter.filter)
        
        // make the appropraite paint changes
        this.map.setPaintProperty(baseFilter.layer, 'line-width', 4)
        this.map.setPaintProperty(baseFilter.layer, 'line-color', '#f7c59f')
        this.map.setPaintProperty(resetFilter.layer, 'line-width', resetFilter.width)
        this.map.setPaintProperty(resetFilter.layer, 'line-color', resetFilter.color)

        // update boundary state to prevent hover effects when boundaries are present & so the ksi/all toggle can stay within the set bounds
        this.setState({boundary: circlesFilter.filter})
    }

    // hide the boundary overlay and reset map filters, styles and sidebar info to default
    removeBoundary = () => {
        // toggle overlay visibility
        this.boundaryOverlay.classList.add('hidden')

        // update sidebar information
        const regionalStats = {type: 'municipality', name: '%'}
        this.props.setDefaultState(regionalStats)
        this.props.setSidebarHeaderContext('the DVRPC region')

        // update map filters and paint properties
        const { county, muni, circles, heat } = removeBoundaryFilter()

        this.map.setFilter(county.layer, county.filter)
        this.map.setFilter(muni.layer, muni.filter)
        this.map.setFilter(circles.layer, circles.filter)
        this.map.setFilter(heat.layer, heat.filter)

        this.map.setPaintProperty(county.layer, 'line-width', county.paint.width)
        this.map.setPaintProperty(county.layer, 'line-color', county.paint.color)
        this.map.setPaintProperty(muni.layer, 'line-width', muni.paint.width)
        this.map.setPaintProperty(muni.layer, 'line-color', muni.paint.color)

        // update boundary state to allow hover effects now that boundaries are removed
        this.setState({boundary: null})
    }

    // add fill effect when hovering over a municipality
    hoverMuniFill = (e, hoveredMuni) => {

        // escape if zoom level isn't right or if a boundary is set
        if(this.map.getZoom() < 8.4 || this.state.boundary) return

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

        // for some reason it needs to handle municipality-fill and municipalities
            // municipality-fill handles updating fill effect within the munis
            // municipalities handles the literal edge cases i.e. if you move your mouse outside the region
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

        // short out if a user clicks on a crash circle
        const circleTest = this.map.queryRenderedFeatures(e.point)[0]
        if(circleTest.source === 'Crashes') return 

        const props = e.features[0].properties
        const id = props.geoid
        const decodedName = props.name
        const featureId = e.features[0].id

        // use the dropdown lookup table to convert muni name into pennDOT id
        let pennID = munis[decodedName]

        const boundaryObj = {type: 'municipality', name: decodedName, id: pennID}

        // do all the things that search does
        this.props.setSidebarHeaderContext(decodedName)
        this.props.getData(boundaryObj)
        this.props.setMapBounding(boundaryObj)
        this.props.getBoundingBox(id, true)

        // set bounding filters
        this.setBoundary(boundaryObj)
        this.showBoundaryOverlay()

        // use featureId to remove the muni fill that hovering created
        this.removeMuniFill(featureId)
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

                <div id="toggle-wrapper" className="shadow overlays" aria-label="Toggle layers" onClick={this.toggleLayerToggles}>
                    <div id="toggle-circles" className="shadow overlays hidden">
                        <h3 className="legend-header centered-text">Toggle Crash Type</h3>
                        <form id="toggle-circles-form" onChange={this.toggleCircleType}>
                            <div>
                                <label htmlFor="KSI">KSI</label>
                                <input id="KSI" type="radio" value="KSI" name="crash-circle-type" defaultChecked />
                            </div>
                            <div>
                                <label htmlFor="All">All</label>
                                <input id="All" type="radio" value="All" name="crash-circle-type" />
                            </div>
                        </form>
                    </div>
                </div>

                <div id="default-extent-btn" className="shadow overlays" aria-label="Default DVRPC Extent" onClick={this.resetControl}>
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
        bounding: state.bounding,
        bbox: state.bbox,
        filter: state.filter
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getData: boundaryObj => dispatch(getDataFromKeyword(boundaryObj)),
        setMapBounding: boundingObj => dispatch(setMapBounding(boundingObj)),
        setSidebarHeaderContext: area => dispatch(setSidebarHeaderContext(area)),
        getBoundingBox: (id, clicked) => dispatch(getBoundingBox(id, clicked)),
        setDefaultState: region => dispatch(getDataFromKeyword(region)),
        setMapFilter: filter => dispatch(setMapFilter(filter))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);