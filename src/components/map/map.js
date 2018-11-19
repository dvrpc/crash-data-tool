import React, { Component } from 'react';
import mapboxgl from "mapbox-gl";

import './map.css';

class Map extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
    }

    // subject to change - did it differently for the TIP
    componentDidMount() {
        mapboxgl.accessToken = 'pk.eyJ1IjoibW1vbHRhIiwiYSI6ImNqZDBkMDZhYjJ6YzczNHJ4cno5eTcydnMifQ.RJNJ7s7hBfrJITOBZBdcOA'
        this.map = new mapboxgl.Map({
            container: this.crashMap,
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [-75.2273, 40.071],
            zoom: 8.82
        })
        this.map.addControl(new mapboxgl.NavigationControl())
    }

    componentWillUnmount() {
        this.map.remove()
    }

    render() {
    return (
        <main id="crashMap" ref={el => this.crashMap = el}>
            <div id="severity-toggle" className="shadow">
                <h3 className="centered-text">Crash Severity</h3>
                <form>
                <hr />
                    <input type="checkbox" value="fatal" checked />Killed<br />
                    <input type="checkbox" value="fatal" />Major Injury<br />
                    <input type="checkbox" value="fatal" />Moderate Injury<br />
                    <input type="checkbox" value="fatal" />Minor Injury<br />
                    <input type="checkbox" value="fatal" />Injury (unknown severity)<br />
                    <input type="checkbox" value="fatal" />Not Injured<br />
                    <input type="checkbox" value="fatal" />Unknown<br />
                </form>
            </div>
        </main>
    );
    }
}

export default Map;
