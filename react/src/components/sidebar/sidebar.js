import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getDataFromKeyword, sidebarCrashType } from '../../redux/reducers/mapReducer.js'

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
            localUpdate: false,
            crashType: 'KSI',
            rangeFrom: 2014,
            rangeTo: 2018
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
            let crashType = check === 'any' || check === 'all' ? 'Killed or Severely Injured (KSI)' : 'All'
            if(crashType != this.state.crashType) this.setState({crashType})
        }
    }

    updateRange = e => {
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

    updateCrashType = e => {
        e.preventDefault()
        const form = e.target
        const data = new FormData(form)
        let selected;

        // extract data
        for(const entry of data) {
            selected = entry[1]
        }

        // use selected radio button to set map filter
        this.props.setCrashTypeFilter(selected)
    }

    render() {
        // set dynamic text
        let area = this.props.context || this.state.context
        let crashType = this.state.crashType
        let rangeFrom = this.state.rangeFrom
        let rangeTo = this.state.rangeTo

        // process the churts
        // @TODO: this is being called too many times. Not a priority but would be a perf improvement to fix
        let data;
        if(this.state.localUpdate) {
            data = this.state.data
        } else if(this.props.data) {
            // @TODO: use state to get range so move this logic into a componentWillUpdate lifecycle and just have charts.makeCharts pull a range object
            let range = {from: 0, to: 0}
            const rangeKeys = Object.keys(this.props.data)
            const lastIndex = rangeKeys.length - 1

            range.from = rangeKeys[0]
            range.to = rangeKeys[lastIndex]

            data = charts.makeCharts(this.props.data, range)
        } else {
            data = charts.makeCharts(null)
        }

        const severityOptions = charts.chartOptions('Injury type', 'Number of persons')
        const trendOptions = charts.chartOptions('', 'Number of Crashes')

        return (
            <section id="sidebar">
                <h1 id="crash-map-sidebar-header" className="centered-text">Crash Statistics for {area}</h1>
                <p className="sidebar-paragraphs">This tool's default setting is limited to five years of killed and severe injury crashes (abbreviated as "KSI") for 2014 to 2018. This dataset is also used by our state and local partners.</p>
                <p className="sidebar-paragraphs">The following charts and map are showing results for <strong>{crashType}</strong> crash types from <strong>{rangeFrom}</strong> to <strong>{rangeTo}</strong>. You can adjust the range and severity type using the forms below.</p>
                
                <form className="crash-map-charts-form" id="crash-map-update-range" onSubmit={this.updateRange}>
                    <fieldset className="crash-maps-charts-fieldset" form="crash-map-update-range">
                        <legend>Select Date Range: </legend>

                        <label htmlFor="from">From: </label>
                        <select id="crash-select-from" name="from" className="crash-map-first-input">
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
                    </fieldset>
                </form>

                <form className="crash-map-charts-form" id="crash-map-update-type" onSubmit={this.updateCrashType}>
                    <fieldset className="crash-maps-charts-fieldset" form="crash-map-update-type">
                        <legend>Select Severity Type: </legend>

                        <label htmlFor="ksi">KSI: </label>
                        <input type="radio" value="ksi" name="crashType" className="crash-map-first-input" defaultChecked></input>

                        <label htmlFor="all">All: </label>
                        <input type="radio" value="all" name="crashType"></input>

                        <button id="crash-range-button" type="submit">Update</button>
                    </fieldset>
                </form>

                <hr id="sidebar-hr" />

                <h2 className="centered-text crash-map-sidebar-subheader">Crashes over Time</h2>
                    <Line data={data.trendChart} options={trendOptions}/>
                    <p className="sidebar-paragraphs">This chart shows <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{rangeFrom}</strong> to <strong>{rangeTo}</strong>. Crash trends can be useful for identifying if the frequency of crashes is increasing or decreasing over time, but it is important not to infer patterns from single-year spikes or drops in crashes or in datasets with limited data points.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Crash Severity</h2>
                    <Bar data={data.severityChart} options={severityOptions}/>
                    <p className="sidebar-paragraphs">This chart shows <em>people</em> involved in <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{rangeFrom}</strong> to <strong>{rangeTo}</strong>. Injury severity is divided into seven possible categories, as defined in the "About" section of the information modal. ** We can workshop this text, including changing the modal to an actionable word isntead of a ? **</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Mode</h2>
                    <Doughnut data={data.modeChart} />
                    <p className="sidebar-paragraphs">This chart shows <em>people</em> involved in <strong>{crashType}</strong> crashes in the <strong>{area}</strong> by mode from <strong>{rangeFrom}</strong> to <strong>{rangeTo}.</strong> Pedestrians and bicyclists are often a focus of transportation safety planning efforts because they are the road users most vulnerable to sever injuries in the event of a crash. This is reflected in data that consistently shows pedestrians account for a disproportionate number of the injuries sustained on the road.</p>
                
                <h2 className="centered-text crash-map-sidebar-subheader">Collision Type</h2>
                    <Doughnut data={data.collisionTypeChart} />
                    <p className="sidebar-paragraphs">This chart shows <strong>{crashType}</strong> <em>crashes</em> in <strong>{area}</strong> by collision type from <strong>{rangeFrom}</strong> to <strong>{rangeTo}</strong>. Collision type data can be especially useful for identifying trends at specific locations or along specific routes.</p>

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
        setDefaultState: region => dispatch(getDataFromKeyword(region)),
        setCrashTypeFilter: filter => dispatch(sidebarCrashType(filter))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
