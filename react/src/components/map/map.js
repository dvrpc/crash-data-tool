import React, { Component } from 'react';
import mapboxgl from "mapbox-gl";

import * as layers from './layers.js'
import './map.css';


class Map extends Component {
    constructor(props){
        // this might not be necessary
        super(props)
        this.state = {

        }
    }

    componentDidMount() {
        mapboxgl.accessToken = 'pk.eyJ1IjoibW1vbHRhIiwiYSI6ImNqZDBkMDZhYjJ6YzczNHJ4cno5eTcydnMifQ.RJNJ7s7hBfrJITOBZBdcOA'
        
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

            // quick hack to get over the small initial paint
            // @TODO: look into why the initial render is a fraction of map container height
            this.map.resize()

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
                console.log('e be ', e)
                this.map.getCanvas().style.cursor = 'pointer'
            })
            this.map.on('mouseleave', 'crash-circles', e => {
                this.map.getCanvas().style = ''
            })

            // clicking a circle creates a popup w/basic information
            this.map.on('click', 'crash-circles', e => {
                // @TODO: refactor this into a utils function within /map
                const properties = e.features[0].properties
                const crn = properties['CRN']
                let totalInjured = properties['TOT_INJ_CO']

                // do the grammar
                totalInjured === 1 ? totalInjured += ' person' : totalInjured += ' people'

                new mapboxgl.Popup({
                    closebutton: true,
                    closeOnClick: true
                }).setLngLat(e.lngLat)
                .setHTML(`
                    <h3 class="crash-popup-header">CRN: ${crn}</h3>
                    <hr />
                    <p>${totalInjured} injured in this crash</p>
                `)
                .addTo(this.map)
            })
        })
    }

    componentWillUnmount() {
        this.map.remove()
    }

    render() {
        return (
            <main id="crashMap" ref={el => this.crashMap = el}>
                <div id="legend" className="shadow">
                    <h3 id="legend-header" className="centered-text">Total Injured</h3>
                    <span id="legend-gradient"></span>
                    <div className="legend-text">
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                        <span>15</span>
                        <span>20</span>
                        <span>25+</span>
                    </div>
                </div>
            </main>
        );
    }
}

export default Map;
