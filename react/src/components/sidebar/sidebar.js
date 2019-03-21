import React, { Component } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

import * as charts from './charts.js'
import Footer from '../footer/footer.js'
import './sidebar.css';


class Sidebar extends Component {
    constructor(props){
        super(props)
        // temporary home for chart data - determine whether Context or Redux makes more sense for global state management and then pull data from there
        this.state = {
            severityData: [12, 8, 15, 14, 17, 24],
            modeData: [9, 7, 15],
            collisionTypeData: [8, 3, 1, 5, 10, 7, 2, 6, 9, 4]
        }
    }
    
    render() {
        // for now just update the charts here
        const severityChart = charts.severity(this.state.severityData)
        const severityOptions = charts.barOptions('Injury type', 'Number of persons')

        const collisionTypeChart = charts.collisionType(this.state.collisionTypeData)

        const modeChart = charts.mode(this.state.modeData)
        const modeOptions = charts.barOptions('Mode', 'Number of persons')

        return (
            <section id="sidebar">
                <h1 id="crash-map-sidebar-header" className="centered-text">Crash Statistics for Selected Area</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem. consectetur adipiscing elit.</p>
                
                <h2 className="centered-text crash-map-sidebar-subheader">Crash Severity</h2>
                    <Bar data={severityChart} options={severityOptions}/>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem. Proin accumsan, nisi ac venenatis vehicula, nisl lorem commodo nibh, nec iaculis sem urna sollicitudin sem.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Mode</h2>
                    <Bar data={modeChart} options={modeOptions} />
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem. Proin accumsan, nisi ac venenatis vehicula, nisl lorem commodo nibh, nec iaculis sem urna sollicitudin sem.</p>
                
                <h2 className="centered-text crash-map-sidebar-subheader">Collision Type</h2>
                    <Doughnut data={collisionTypeChart} />
                    <p><strong>Note:</strong> The collision type pie chart is an example of how it would look in the worst case scenario, where the selected area has at least 1 instance of every single collision type.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">A Subheader</h2>
                    <ul id="crash-map-sidebar-ul" className="shadow">
                        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                        <li>Mauris pulvinar sed quam nec finibus. Nulla sed.</li>
                        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                        <li>Mauris pulvinar sed quam nec finibus. Nulla sed.</li>
                        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    </ul>

                    <p>In tincidunt viverra nisi, sed aliquam risus blandit eget. Donec consequat purus commodo dignissim varius. Nulla eleifend orci ut massa ornare dictum. Phasellus rutrum nisi sed ipsum blandit eleifend. Nulla consequat sollicitudin enim, a fermentum.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Another Subheader</h2>
                    <p>This thing comes fully loaded. AM/FM radio, reclining bucket seats, and... power windows. Hey, you know how I'm, like, always trying to save the planet? Here's my chance. Forget the fat lady! You're obsessed with the fat lady! Drive us out of here! Do you have any idea how long it takes those cups to decompose.</p>

                <Footer />
            </section>
        );
    }
}

export default Sidebar;
