import React, { Component } from 'react';

import Navbar from '../navbar/navbar.js'
import Sidebar from '../sidebar/sidebar.js'
import Map from '../map/map.js'
import PrintPage from '../printPage/printPage.js'

import './crashMapContainer.css';

class CrashMapContainer extends Component {
  render() {
    return (
        <div id="crash-map-container">
            <Navbar />

            <div id="crash-map-content-wrapper" className="no-print">
                <Sidebar />
                <Map />
            </div>
            
            <PrintPage />
        </div>
    );
  }
}

export default CrashMapContainer;
