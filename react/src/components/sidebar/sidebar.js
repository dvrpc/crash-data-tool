import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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

        // setState to update data & trigger a re-render
        this.setState({data, localUpdate})
    }

    render() {

        // process the churts
        let data;
        if(this.state.localUpdate) {
            data = this.state.data
        } else if(this.props.data) {
            let range = {from: 0, to: 0}
            const rangeKeys = Object.keys(this.props.data)
            const lastIndex = rangeKeys.length - 1

            range.from = rangeKeys[0]
            range.to = rangeKeys[lastIndex]

            data = charts.makeCharts(this.props.data, range)
        } else {
            data = charts.makeCharts(null)
        }

        let area = this.props.context || this.state.context
        const severityOptions = charts.chartOptions('Injury type', 'Number of persons')
        const trendOptions = charts.chartOptions('', 'Number of Crashes')

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
                                <option value="2014">2014</option>
                                <option value="2015">2015</option>
                                <option value="2016">2016</option>
                                <option value="2017">2017</option>
                                <option value="2018">2018</option>
                            </select>
                            <label htmlFor="to">To: </label>
                            <select name="to">
                                <option value="2018">2018</option>
                                <option value="2017">2017</option>
                                <option value="2016">2016</option>
                                <option value="2015">2015</option>
                                <option value="2014">2014</option>
                            </select>
                            <button id="crash-range-button" type="submit">Update</button>
                        </div>
                    </fieldset>
                </form>

                <h2 className="centered-text crash-map-sidebar-subheader">Crashes over Time</h2>
                    <Line data={data.trendChart} options={trendOptions}/>
                    <p className="sidebar-paragraphs">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Crash Severity</h2>
                    <Bar data={data.severityChart} options={severityOptions}/>
                    <p className="sidebar-paragraphs">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Mode</h2>
                    <Doughnut data={data.modeChart} />
                    <p className="sidebar-paragraphs">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec arcu purus, facilisis a pharetra bibendum, consequat sed lorem.</p>
                
                <h2 className="centered-text crash-map-sidebar-subheader">Collision Type</h2>
                    <Doughnut data={data.collisionTypeChart} />
                    <p><strong>Note:</strong> The collision type pie chart is an example of how it would look in the worst case scenario, where the selected area has at least 1 instance of every single collision type.</p>

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
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setDefaultState: region => dispatch(getDataFromKeyword(region))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
