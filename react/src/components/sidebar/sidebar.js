import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Bar, Doughnut } from 'react-chartjs-2';
import { getDataFromKeyword } from '../../redux/reducers/mapReducer.js'

import * as charts from './charts.js'
import Footer from '../footer/footer.js'
import './sidebar.css';


class Sidebar extends Component {
    constructor(props) {
        super(props)

        // load default state from the jawn
        this.state = {
            data: this.props.setDefaultState({type: 'municipality', name: '%'}),
            context: 'the DVRPC region'
        }
    }

    updateChartRange = e => {
        e.preventDefault()

        let range = {from: 0, to: 0}
        const form = e.target
        const data = new FormData(form)
        
        //get the inputs from the dropdowns
        for(var [key, input] of data.entries()) {
            if(key === 'from') {
                range.from = input
            }else{
                range.to = input
            }
        }

        console.log('selected range is ', range)

        // send the inputs to makeCharts 
    }

    render() {
        // process the churts
        let data = this.props.data ? charts.makeCharts(this.props.data) : charts.makePlaceholders()        
        let area = this.props.context || this.state.context
        const severityOptions = charts.barOptions('Injury type', 'Number of persons')

        return (
            <section id="sidebar">
                <h1 id="crash-map-sidebar-header" className="centered-text">Crash Statistics for {area}</h1>
                    <p className="sidebar-paragraphs">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem. consectetur adipiscing elit.</p>
                
                <hr />

                <form id="update-charts-form" onSubmit={this.updateChartRange}>
                    <fieldset form="update-charts-form">
                        <legend>Select Data Range: </legend>

                        <div id="crash-metrics-range-input-wrapper">
                            <label htmlFor="crash-metrics-from-year">From: </label>
                            <select name="from">
                                <option value="2012">2012</option>
                                <option value="2013">2013</option>
                                <option value="2014">2014</option>
                                <option value="2015">2015</option>
                                <option value="2016">2016</option>
                                <option value="2017">2017</option>
                            </select>

                            <label htmlFor="crash-metrics-to-year">To: </label>
                            <select name="to">
                                <option value="2017">2017</option>
                                <option value="2016">2016</option>
                                <option value="2015">2015</option>
                                <option value="2014">2014</option>
                                <option value="2013">2013</option>
                                <option value="2012">2012</option>
                            </select>
                        </div>
                    </fieldset>
                    <button type="submit">Update</button>
                </form>

                <h2 className="centered-text crash-map-sidebar-subheader">Crash Severity</h2>
                    <Bar data={data.severityChart} options={severityOptions}/>
                    <p className="sidebar-paragraphs">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem. Proin accumsan, nisi ac venenatis vehicula, nisl lorem commodo nibh, nec iaculis sem urna sollicitudin sem.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Mode</h2>
                    <Doughnut data={data.modeChart} />
                    <p className="sidebar-paragraphs">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem. Proin accumsan, nisi ac venenatis vehicula, nisl lorem commodo nibh, nec iaculis sem urna sollicitudin sem.</p>
                
                <h2 className="centered-text crash-map-sidebar-subheader">Collision Type</h2>
                    <Doughnut data={data.collisionTypeChart} />
                    <p><strong>Note:</strong> The collision type pie chart is an example of how it would look in the worst case scenario, where the selected area has at least 1 instance of every single collision type.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">A Subheader</h2>
                    <ul id="crash-map-sidebar-ul" className="shadow">
                        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                        <li>Mauris pulvinar sed quam nec finibus. Nulla sed.</li>
                        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                        <li>Mauris pulvinar sed quam nec finibus. Nulla sed.</li>
                        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    </ul>

                    <p className="sidebar-paragraphs">In tincidunt viverra nisi, sed aliquam risus blandit eget. Donec consequat purus commodo dignissim varius. Nulla eleifend orci ut massa ornare dictum. Phasellus rutrum nisi sed ipsum blandit eleifend. Nulla consequat sollicitudin enim, a fermentum.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Another Subheader</h2>
                    <p className="sidebar-paragraphs">This thing comes fully loaded. AM/FM radio, reclining bucket seats, and... power windows. Hey, you know how I'm, like, always trying to save the planet? Here's my chance. Forget the fat lady! You're obsessed with the fat lady! Drive us out of here! Do you have any idea how long it takes those cups to decompose.</p>

                <Footer />
            </section>
        );
    }
}

const mapStateToProps = state => {
    return {
        data: state.data,
        context: state.area
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setDefaultState: region => dispatch(getDataFromKeyword(region))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
