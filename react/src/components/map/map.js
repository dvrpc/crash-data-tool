import React, { Component } from 'react';
import { connect } from 'react-redux'
import mapboxgl from "mapbox-gl";

import * as layers from './layers.js'
import * as popups from './popups.js';
import { createBoundaryFilter } from './boundaryFilters.js'
import './map.css';

class Map extends Component {
    constructor(props){
        super(props)
        this.state = {
            center: null,
            bounding: false
        }
    }

    componentDidMount() {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
        
        this.map = new mapboxgl.Map({
            container: this.crashMap,
            // optoins: basic (some colors), light (greyscale), 
            style: 'mapbox://styles/mapbox/dark-v9',
            center: this.state.center || [-75.2273, 40.071],
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

                // @TODO: handle multiple features at the same point. 
                // loop through features.length and call getPopupInfo(e) for each feature
                // store the results as an array of promises and then promise.All them jawns to create a paginated list of popups
                    // this will work w/the current structure and handle cases where not every feature has a response

                // get info
                const popupInfo = popups.getPopupInfo(e)

                // initialize the mapbox popup object
                const popup = new mapboxgl.Popup({
                    closebutton: true,
                    closeOnClick: true
                }).setLngLat(e.lngLat)

                popupInfo.then(result => {
                    // create a popup or alert user about an error if the fetch fails
                    if(result.fail){
                        popups.catchPopupFail(popup, this.map, result.id)
                    }else{
                        popups.setPopup(result, popup, this.map)
                    }
                })
            })

            // @TODO: add the map update info here once the database is updated. 
            // something like: if (this.props.bounding.name){map.onZoomEnd(updateSidebar(newCoords))}
        })
    }

    componentDidUpdate(prevProps) {
        if(prevProps.center !== this.props.center) {
            const center = this.props.center
            this.setState({ center })
        }

        if(this.props.bounding.name) {
            //@TODO: figure out a good way to clear existing filters. 
            // The obvious solution is to just set the muni and county filters to their default but there might be a better way

            const boundingObj = this.props.bounding
            const filter = createBoundaryFilter(boundingObj)

            this.map.setFilter(filter.layer, filter.layerFilter)            
            this.map.setPaintProperty(filter.layer, 'line-width', 4)
            this.map.setPaintProperty(filter.layer, 'line-color', '#f7c59f')
        }

        if(this.state.center){
            this.map.flyTo({
                center: this.state.center,
                // @TODO: dynamic zoom levels to handle address search, county search, etc
                zoom: 12,
                speed: 0.9,
                curve: 1.7
            })
        }
    }

    componentWillUnmount() {
        this.map.remove()
    }

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
        bounding: state.bounding
    }
}

// to send co-ordinates for API calls
const mapDispatchToProps = dispatch => {
    return {
        apiCoords: coords => dispatch()
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);