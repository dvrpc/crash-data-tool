import React, { Component } from 'react';
import mapboxgl from "mapbox-gl";

import * as layers from './layers.js'
import './map.css';

class Map extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
    }

    toggleSeverity = e => {
        console.log('selected severity is ', e)
    }

    componentDidMount() {
        mapboxgl.accessToken = 'pk.eyJ1IjoibW1vbHRhIiwiYSI6ImNqZDBkMDZhYjJ6YzczNHJ4cno5eTcydnMifQ.RJNJ7s7hBfrJITOBZBdcOA'
        
        this.map = new mapboxgl.Map({
            container: this.crashMap,
            style: 'mapbox://styles/mapbox/basic-v9',
            center: [-75.2273, 40.071],
            zoom: 8.2
        })

        this.map.addControl(new mapboxgl.NavigationControl())

        // add Region layer
        this.map.on('load', () => {
            this.map.addSource("Boundaries" , {
                type: 'vector',
                url: 'https://tiles.dvrpc.org/data/dvrpc-municipal.json'
            })

            this.map.addLayer(layers.countyOutline)
            this.map.addLayer(layers.municipalityOutline)
        })
    }

    componentWillUnmount() {
        this.map.remove()
    }

    render() {
        return (
            <main id="crashMap" ref={el => this.crashMap = el}>
                {/* @TODO: maybe re-consider shadow. Looking over a map may be one of the few instances where having no x or y offset makes sense.. */}
                <div id="severity-toggle" className="shadow">
                    <h3 className="centered-text">Crash Severity</h3>
                    <hr />
                    <form onChange={this.toggleSeverity}>
                        <input type="checkbox" value="killed" defaultChecked />Killed<br />
                        <input type="checkbox" value="major injury" />Major Injury<br />
                        <input type="checkbox" value="moderate injury" />Moderate Injury<br />
                        <input type="checkbox" value="minor injury" />Minor Injury<br />
                        <input type="checkbox" value="unknown injury" />Injury (unknown severity)<br />
                        <input type="checkbox" value="no injury" />Not Injured<br />
                        <input type="checkbox" value="unknown" />Unknown<br />
                    </form>
                </div>
            </main>
        );
    }
}

export default Map;