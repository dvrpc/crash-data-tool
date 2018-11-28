import React, { Component } from 'react';

import Navbar from '../navbar/navbar.js'
import Sidebar from '../sidebar/sidebar.js'
import Map from '../map/map.js'

import './crashMapContainer.css';

class CrashMapContainer extends Component {
  render() {
    return (
        <div id="crash-map-container">
            <Navbar />

            <div id="crash-map-content-wrapper">
                <Sidebar />
                <Map />
            </div>
        </div>
    );
  }
}

export default CrashMapContainer;
