import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getDataFromKeyword, sidebarCrashType, sidebarRange } from '../../redux/reducers/mapReducer.js'

import * as charts from './charts.js'
import Footer from '../footer/footer.js'
import './sidebar.css';


class Sidebar extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: this.props.setCrashState({type: 'municipality', name: '%', isKSI: 'yes'}),
            context: 'the DVRPC region',
            crashType: 'KSI',
            from: 2014,
            to: 2018
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

        // update store state
        this.props.setCrashRange(range)

        // setState to update data & trigger a re-render
        this.setState({
            data, 
            from: range.from,
            to: range.to
        })
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

        // update crashType dynamic text & filter
        selected = selected === 'ksi' ? 'KSI' : 'All'

        // update data and set crashType state
        if(selected !== this.state.crashType) {

            let nameTest = this.props.context.split(' ')
            let countyCheck = nameTest.pop()
            let isCounty = countyCheck === 'County' ? true : false

            // @TODO: need to pass bbox as the name for the selected area case...
            let name;
            let type;

            if (isCounty) {
                name = encodeURIComponent(nameTest[0])
                type = 'county'
            } else {
                name = encodeURIComponent(this.props.context)
                type = 'municipality'
            }
            let isKSI = selected === 'KSI' ? 'yes' : 'no'
            
            // get updated data and setState
            this.props.setCrashState({type, name, isKSI})
            this.setState({crashType: selected})
        }


    }

    render() {
        // set dynamic text
        let area = this.props.context || this.state.context
        let crashType = this.state.crashType
        let from = this.state.from
        let to = this.state.to
        let chartsRange = {from, to}

        // draw charts
        let data;
        if(this.props.data){
            data = charts.makeCharts(this.props.data, chartsRange)
        }else{
            // placeholder state while waiting for default fetch response
            data = charts.makeCharts(null, chartsRange)
        }

        const severityOptions = charts.chartOptions('Injury type', 'Number of persons')
        const trendOptions = charts.chartOptions('', 'Number of Crashes')

        return (
            <section id="sidebar">
                <h1 id="crash-map-sidebar-header" className="centered-text">Crash Statistics for {area}</h1>
                <p className="sidebar-paragraphs">This tool's default setting is limited to five years of killed and severe injury crashes (abbreviated as "KSI") for 2014 to 2018. This dataset is also used by our state and local partners.</p>
                <p className="sidebar-paragraphs">The following charts and map are showing results for <strong>{crashType}</strong> crash types from <strong>{from}</strong> to <strong>{to}</strong>. You can adjust the range and severity type using the forms below.</p>
                
                <form className="crash-map-charts-form" id="crash-map-update-range" onSubmit={this.updateRange}>
                    <fieldset className="crash-map-charts-fieldset" form="crash-map-update-range">
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
                    <fieldset className="crash-map-charts-fieldset" form="crash-map-update-type">
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
                    <p className="sidebar-paragraphs">This chart shows <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{from}</strong> to <strong>{to}</strong>. Crash trends can be useful for identifying if the frequency of crashes is increasing or decreasing over time, but it is important not to infer patterns from single-year spikes or drops in crashes or in datasets with limited data points.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Crash Severity</h2>
                    <Bar data={data.severityChart} options={severityOptions}/>
                    <p className="sidebar-paragraphs">This chart shows <em>people</em> involved in <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{from}</strong> to <strong>{to}</strong>. Injury severity is divided into seven possible categories, as defined in the "About" section of the information modal. ** We can workshop this text, including changing the modal to an actionable word isntead of a ? **</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Mode</h2>
                    <Doughnut data={data.modeChart} />
                    <p className="sidebar-paragraphs">This chart shows <em>people</em> involved in <strong>{crashType}</strong> crashes in the <strong>{area}</strong> by mode from <strong>{from}</strong> to <strong>{to}.</strong> Pedestrians and bicyclists are often a focus of transportation safety planning efforts because they are the road users most vulnerable to sever injuries in the event of a crash. This is reflected in data that consistently shows pedestrians account for a disproportionate number of the injuries sustained on the road.</p>
                
                <h2 className="centered-text crash-map-sidebar-subheader">Collision Type</h2>
                    <Doughnut data={data.collisionTypeChart} />
                    <p className="sidebar-paragraphs">This chart shows <strong>{crashType}</strong> <em>crashes</em> in <strong>{area}</strong> by collision type from <strong>{from}</strong> to <strong>{to}</strong>. Collision type data can be especially useful for identifying trends at specific locations or along specific routes.</p>

                <Footer />
            </section>
        );
    }
}

const mapStateToProps = state => {
    return {
        data: state.data,
        context: state.area,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCrashState: region => dispatch(getDataFromKeyword(region)),
        setCrashTypeFilter: filter => dispatch(sidebarCrashType(filter)),
        setCrashRange: range => dispatch(sidebarRange(range))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
