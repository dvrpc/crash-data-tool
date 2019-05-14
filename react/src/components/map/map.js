import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactPaginate from 'react-paginate';
import { connect } from 'react-redux'
import mapboxgl from "mapbox-gl";

import * as layers from './layers.js'
import * as popups from './popups.js';
import { createBoundaryFilter } from './boundaryFilters.js'
import './map.css';

class Map extends Component {
    constructor(props){
        super(props)
    }

    componentDidMount() {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
        
        this.map = new mapboxgl.Map({
            container: this.crashMap,
            // optoins: basic (some colors), light (greyscale), 
            style: 'mapbox://styles/mapbox/dark-v9',
            center: [-75.2273, 40.071],
            zoom: 8.2
        })

        this.map.addControl(new mapboxgl.NavigationControl())

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
            this.map.addLayer(layers.municipalityOutline)

            // add crash data layers
            this.map.addLayer(layers.crashHeat)
            this.map.addLayer(layers.crashCircles)

            // hovering over a circle changes pointer & bumps the radius to let users know they're interactive
            this.map.on('mousemove', 'crash-circles', e => {
                this.map.getCanvas().style.cursor = 'pointer'
            })
            this.map.on('mouseleave', 'crash-circles', e => {
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

            // @TODO: add the map update info here once the database is updated. 
            // something like: if (!this.props.bounding.name){map.onZoomEnd(updateSidebar(newCoords))}
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
        }
    }

    componentWillUnmount() {
        this.map.remove()
    }
    /*
        Refactor the legend div to a component that accepts props (determined by zoom level)
        default state: Title: Crash Density. Scale: same gradient, 0 - 10+ (?)
        zoom state: Title: Max Injury Severity. Scale: No injury - fatal (this is the current legend)
        Props to pass: title (h3 text), minRange, maxRange
    */

    render() {
        return (
            <main id="crashMap" ref={el => this.crashMap = el}>
                <div id="legend" className="shadow">
                    <h3 id="legend-header" className="centered-text">Max Injury Severity</h3>
                    <span id="legend-gradient"></span>
                    <div className="legend-text">
                        <span>No Injury</span>
                        <span>Fatal</span>
                    </div>
                </div>
            </main>
        );
    }
}

// to receive co-ordinates for the new map center
const mapStateToProps = state => {
    return {
        center: state.center,
        bounding: state.bounding,
        bbox: state.bbox
    }
}

// to send co-ordinates for API calls
const mapDispatchToProps = dispatch => {
    return {
        apiCoords: coords => dispatch(coords)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);