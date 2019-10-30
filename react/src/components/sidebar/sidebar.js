import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Bar, Doughnut } from 'react-chartjs-2';
import { getDataFromKeyword } from '../../redux/reducers/mapReducer.js'

import * as charts from './charts.js'
import Footer from '../footer/footer.js'
import './sidebar.css';

// @TODO for global filter state:
// charts.makeCharts will accept a parameter for filter state and use that to filter down the outputs


class Sidebar extends Component {
    constructor(props) {
        super(props)

        // load default state from the jawn (possibly add a range field to state which defaults to null and updates whenever a new range is picked)
        this.state = {
            data: this.props.setDefaultState({type: 'municipality', name: '%'}),
            context: 'the DVRPC region',
            localUpdate: false
        }
    }

    componentDidUpdate(prevProps) {

        // turn off local update for new searches so that the charts update with props instead of local state
        if(this.props.context !== prevProps.context && this.state.localUpdate) {
            const localUpdate = false
            this.setState({localUpdate})
        }

        // update crash type context
        if(this.props.filter){
            const check = this.props.filter[0]
            // this is a brittle hack but it works as long as the filters dont change...
            this.activeCrashTypes.textContent = check === 'any' || check === 'all' ? 'Killed or Severely Injured (KSI)' : 'All'
        }

        // it's possible that once a range is established, users will want that to persist throughout searches
        // in that case, range will exist on local state and all instances of makeCharts will pass this.state.range
            // default value will be null so that the default state can load with the full range
    }

    updateChartRange = e => {
        e.preventDefault()

        let range = {from: 0, to: 0}
        const form = e.target
        const formData = new FormData(form)
        
        //get the inputs from the dropdowns
        for(var [key, input] of formData.entries()) {
            if(key === 'from') {
                range.from = input
            }else{
                range.to = input
            }
        }

        // send the inputs to makeCharts 
        const data = charts.makeCharts(this.props.data, range)

        // tell render to listen to state instead of props
        const localUpdate = true

        // setState to trigger a re-render
        this.setState({data, localUpdate})
    }

    render() {

        // process the churts (possibly add this.state.range to the props version of charts.makeCharts if we want range to persist throughout searches)
        // @TODO: incoporate polygon response into this decision
        let data = this.state.localUpdate ? this.state.data : charts.makeCharts(this.props.data)
        let area = this.props.context || this.state.context
        const severityOptions = charts.barOptions('Injury type', 'Number of persons')

        return (
            <section id="sidebar">
                <h1 id="crash-map-sidebar-header" className="centered-text">Crash Statistics for {area}</h1>
                    <p className="sidebar-paragraphs">Lorem ipsum dolor sit amet, consectetur adipiscing elit. The following charts are showing results for <span id="activeCrashTypes" ref={el => this.activeCrashTypes = el}>Killed or Severely Injured (KSI)</span> crash types.</p>
                
                <hr id="sidebar-hr" />

                <form id="update-charts-form" onSubmit={this.updateChartRange}>
                    <fieldset id="update-charts-fieldset" form="update-charts-form">
                        <legend>Select Charts Data Range: </legend>
                        <div id="crash-range-input-wrapper">
                            <label htmlFor="from">From: </label>
                            <select id="crash-select-from" name="from">
                                <option value="2012">2012</option>
                                <option value="2013">2013</option>
                                <option value="2014">2014</option>
                                <option value="2015">2015</option>
                                <option value="2016">2016</option>
                                <option value="2017">2017</option>
                            </select>
                            <label htmlFor="to">To: </label>
                            <select name="to">
                                <option value="2017">2017</option>
                                <option value="2016">2016</option>
                                <option value="2015">2015</option>
                                <option value="2014">2014</option>
                                <option value="2013">2013</option>
                                <option value="2012">2012</option>
                            </select>
                            <button id="crash-range-button" type="submit">Update</button>
                        </div>
                    </fieldset>
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
        context: state.area,
        filter: state.filter,

        // @TODO: polygon jawns
        polyData: state.polyCrashes
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setDefaultState: region => dispatch(getDataFromKeyword(region))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
