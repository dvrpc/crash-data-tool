import React, { Component } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'


class Geocoder extends Component {
    
    initialize = () => {
        const container = this.geocoderDiv
        this.geocoder = new MapboxGeocoder({
            accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
            flyTo: false,
            countries: 'us',
            bbox: [-76.09405517578125, 39.49211914385648,-74.32525634765625,40.614734298694216]
        })

        container.appendChild(this.geocoder.onAdd(this.props.search))
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