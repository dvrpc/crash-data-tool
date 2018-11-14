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
            style: 'mapbox://styles/mapbox/light-v9',
            center: [-75.2273, 40.071],
            zoom: 8.82
        })
    }

    componentWillUnmount() {
        this.map.remove()
    }

    render() {
    return (
        <div id="crashMap" ref={el => this.crashMap = el}>
            
        </div>
    );
    }
}

export default Map;
