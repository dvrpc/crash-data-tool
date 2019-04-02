import React, { Component } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'


class Geocoder extends Component {
    
    initialize = () => {
        const container = this.geocoderDiv
        this.geocoder = new MapboxGeocoder({
            accesToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
        })

        container.appendChild(this.geocoder)
    }

    componentDidMount() {
        this.initialize()
    }

    render() {
        return (
            <div id="geocoder" ref={e => (this.geocoderDiv = e)}></div>    
        )
    }
}

export default Geocoder;