import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactPaginate from 'react-paginate';
import { connect } from 'react-redux'
import mapboxgl from "mapbox-gl";

import * as layers from './layers.js'
import * as popups from './popups.js';
import { createBoundaryFilter } from './boundaryFilters.js';
import { getDataFromKeyword, setSidebarHeaderContext, getBoundingBox, setMapBounding  } from '../../redux/reducers/mapReducer.js'
import './map.css';

class Map extends Component {
    componentDidMount() {
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

                /* muni hover effect - add back in after VT's are updated & then make it a function b/c counties will use this too
                    // need this from the mapbox example
                    let hoveredMuni = null
                    
                    // add interactivity to municipalities (work on this pending VT updates so we can use setFeatureState)
                    this.map.on('mousemove', 'municipality-fill', e => {

                        console.log('moved on muni')
                        // escape if zoom level isn't right

                        if(e.features.length > 0 ) {
                            
                            // update old hover jawn
                            if(hoveredMuni) {
                                this.map.setFeatureState(
                                    {source: 'Boundaries', sourceLayer: 'municipality-outline', id: hoveredMuni},
                                    {hover: false}
                                )
                            }

                            hoveredMuni = +e.features[0].properties.geoid
            
                            this.map.setFeatureState(
                                {source: 'Boundaries', sourceLayer: 'municipality-outline', id: hoveredMuni},
                                {hover: true}
                            )
                        }
                    })

                    this.map.on('mouseleave', 'municipality-outline', e => {
                        
                    })
                */
                
            // hovering over a circle changes pointer & bumps the radius to let users know they're interactive
            this.map.on('mousemove', 'crash-circles', e => {
                this.map.getCanvas().style.cursor = 'pointer'

            })
            this.map.on('mouseleave', 'crash-circles', e => {
                this.map.getCanvas().style = ''
            })

            // clicking a municipality triggers the same set of actions as searching by muni
            this.map.on('click', 'municipality-fill', e => {
                const props = e.features[0].properties
                const decodedName = props.name
                const boundaryObj = {type: 'municipality', name: decodedName}

                // do all the things that search does
                // dispatch actions to: set sidebar header, fetch the data and create a bounding box for the selected area
                this.props.setSidebarHeaderContext(decodedName)
                this.props.getData(boundaryObj)
                this.props.setMapBounding(boundaryObj)
                
                // for this one, hit the regular bounding endpoint b/c we have geoid for these jawns
                //this.props.getBoundingBox(boundary.id)
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

        if(this.props.bounding) {
            const boundingObj = this.props.bounding
            const filter = createBoundaryFilter(boundingObj)
            const baseFilter = filter.baseFilter
            const resetFilter = filter.resetFilter
            const heatFilter = filter.heatFilter
            const circleFilter = filter.circlesFilter

            // set the appropriate filters
            this.map.setFilter(baseFilter.layer, baseFilter.filter)
            this.map.setFilter(resetFilter.layer, resetFilter.filter)
            this.map.setFilter(heatFilter.layer, heatFilter.filter)
            this.map.setFilter(circleFilter.layer, circleFilter.filter)
            
            // make the appropraite paint changes
            this.map.setPaintProperty(baseFilter.layer, 'line-width', 4)
            this.map.setPaintProperty(baseFilter.layer, 'line-color', '#f7c59f')
            this.map.setPaintProperty(resetFilter.layer, 'line-width', resetFilter.width)
            this.map.setPaintProperty(resetFilter.layer, 'line-color', resetFilter.color)
        }else{
            // @TODO: remove the bounding box filter whenever a user goes back to an address search
            console.log('add in the code to remove filters ')
        }

    }

    componentWillUnmount() {
        this.map.remove()
    }

    // function to reset map to default view on
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

    // function to toggle which circles are on the map (defaults to KSI)
    toggleCircleType = e => {
        const id = e.target.id
        let filter;

        // create a filter based on the selected radio input
        if(id === 'All') {
            filter = null
        }else {
            filter = ['any', 
                ['==', ['get', 'max_sever'], '1'],
                ['==', ['get', 'max_sever'], '2'],
            ]
        }

        // update the crash circle filter
        this.map.setFilter('crash-circles', filter)
    }

    render() {
        return (
            <main id="crashMap" ref={el => this.crashMap = el}>
                <div id="legend" className="shadow overlays">
                    <h3 className="legend-header centered-text">Max Injury Severity</h3>
                    <span id="legend-gradient"></span>
                    <div className="legend-text">
                        <span>No Injury</span>
                        <span>Fatal</span>
                    </div>
                </div>

                <div id="toggle-wrapper" className="shadow overlays" onClick={this.toggleLayerToggles}>
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
            </main>
        );
    }
}

const mapStateToProps = state => {
    return {
        center: state.center,
        bounding: state.bounding,
        bbox: state.bbox
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getData: boundaryObj => dispatch(getDataFromKeyword(boundaryObj)),
        setMapBounding: boundingObj => dispatch(setMapBounding(boundingObj)),
        setSidebarHeaderContext: area => dispatch(setSidebarHeaderContext(area)),
        getBoundingBox: id => dispatch(getBoundingBox(id))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);