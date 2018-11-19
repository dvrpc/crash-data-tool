import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';

import './sidebar.css';

// replace with response props from queryRenderedFeatures
const dummyData = {
    labels: ['2013', '2014', '2015', '2016', '2017'],
    datasets: [{
        label: 'Crashes',
        data: [12, 11, 15, 14, 17],
        backgroundColor: '#483d3f'
    }]
}

class Sidebar extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
    }
    render() {
    return (
        <section id="sidebar">
            <h1 id="crash-map-sidebar-header" className="centered-text">487 Crashes</h1>

            <Bar data={dummyData} />

            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem. Proin accumsan, nisi ac venenatis vehicula, nisl lorem commodo nibh, nec iaculis sem urna sollicitudin sem.
            </p>

            <h2 className="centered-text crash-map-sidebar-subheader">A Subheader</h2>

            <ul id="crash-map-sidebar-ul">
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                <li>Mauris pulvinar sed quam nec finibus. Nulla sed.</li>
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                <li>Mauris pulvinar sed quam nec finibus. Nulla sed.</li>
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            </ul>

            <p>
                In tincidunt viverra nisi, sed aliquam risus blandit eget. Donec consequat purus commodo dignissim varius. Nulla eleifend orci ut massa ornare dictum. Phasellus rutrum nisi sed ipsum blandit eleifend. Nulla consequat sollicitudin enim, a fermentum.
            </p>
        </section>
    );
    }
}

export default Sidebar;
