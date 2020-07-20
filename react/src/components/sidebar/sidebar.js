import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import {counties, munis } from '../search/dropdowns'
import { getDataFromKeyword, sidebarCrashType, sidebarRange, setSrc } from '../../redux/reducers/mapReducer.js'

import * as charts from './charts.js'
import Footer from '../footer/footer.js'
import './sidebar.css';


class Sidebar extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: 'default',
            context: 'the DVRPC region',
            crashType: 'KSI',
            from: 2014,
            to: 2018
        }

        this.props.getCrashData({geoID: '', isKSI: 'yes'})
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

        // update store state
        this.props.setCrashRange(range)

        // setState to update data & trigger a re-render
        this.setState({
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
            let context = this.props.context || this.state.context
            let isKSI = selected === 'KSI' ? 'yes' : 'no'

            // return special case for regional stats
            if(context === 'the DVRPC region') {
                this.setState({crashType: selected, data: 'calc'})
                this.props.getCrashData({geoID: '', isKSI})
                return
            }

            // handle  Philly being both a county and muni
            if(context === 'Philadelphia City') context = 'Philadelphia County'

            let nameArr = context.split(' ')
            const countyCheck = nameArr.pop()
            let isCounty = countyCheck === 'County' ? true : false
            
            let geoID;
            let geojson;
            const bbox = this.props.polygonBbox

            // assign values to geoId and geojson
            geoID = isCounty ? counties[nameArr[0]] : munis[context]
            geojson = bbox
            
            // update data and local state
            this.setState({crashType: selected, data: 'calc'})
            this.props.getCrashData({geoID, geojson, isKSI})
        }
    }

    setSrc = () => {
        const mapCanvas = document.querySelector('.mapboxgl-canvas')
        const src = mapCanvas.toDataURL()
        this.props.setSrc(src)
    }

    getTotals = data => {
        const totalsObj = {crashes: 'calculating...', fatalities: 'calculating...', severe: 'calculating...', peds: 'calculating...', bikes: 'calculating...'}

        if(data && data.crashes.length) {
            totalsObj.crashes = data.crashes.reduce((total, num) => total + num).toLocaleString()
            totalsObj.fatalities = data.severity[0].toLocaleString()
            totalsObj.severe = (data.severity[0] + data.severity[1]).toLocaleString()
            totalsObj.peds = data.mode[1].toLocaleString()
            totalsObj.bikes = data.mode[0].toLocaleString()
        }

        return totalsObj
    }

    // shallow compare the first layer of objects
    compare = (obj1, obj2) => {
        for(var data in obj1) {
            const inner1 = obj1[data]
            const inner2 = obj2[data]

            for (var data2 in inner1) {
                if(inner1[data2] !== inner2[data2]) return false
                break
            }
        }
        
        return true
    }

    componentDidUpdate(prevProps) {
        const checkOld = prevProps.data
        const checkNew = this.props.data
        const current = this.state.data
        
        // handle totals/charts state transitions
        if(checkNew && current === 'default') this.setState( {data: this.props.data} )
        else if(checkNew && checkOld) {
            const areEqual = this.compare(checkNew, checkOld)
            if(!areEqual) this.setState( {data: this.props.data} )
        }
    }

    render() {
        // set dynamic text
        let area = this.props.context || this.state.context
        let crashType = this.state.crashType
        let from = this.state.from
        let to = this.state.to
        let chartsRange = {from, to}
        let data;
        let totals;

        // populate chart data
        if(this.state.data){
            data = charts.makeCharts(this.state.data, chartsRange)
            const totalsObj = {crashes: data.trendChart.datasets[0].data, severity: data.severityChart.datasets[0].data, mode: data.modeChart.datasets[0].data}
            totals = this.getTotals(totalsObj)
        }else{
            // placeholder state while waiting for default fetch response
            data = charts.makeCharts(null, chartsRange)
            totals = this.getTotals()
        }

        const severityOptions = charts.chartOptions('Injury type', 'Number of persons')
        const trendOptions = charts.chartOptions('', 'Number of Crashes')

        return (
            <section id="sidebar" className="no-print">
                <h1 id="crash-map-sidebar-header" className="centered-text">Crash Statistics for {area}</h1>
                <span id="crash-map-print-sidebar" onClick={this.setSrc}>print statistics</span>
                <p className="sidebar-paragraphs first-paragraph">This tool's default setting is limited to five years of killed and severe injury crashes (abbreviated as "KSI") for 2014 to 2018. Five years of data is typically used by local, state, and federal partners in safety analyses.</p>
                <p className="sidebar-paragraphs">The following charts and map are showing results for <strong>{crashType}</strong> crash types from <strong>{from}</strong> to <strong>{to}</strong>. You can adjust the range and severity type using the forms below.</p>
                
                <form className="crash-map-charts-form" id="crash-map-update-range" onSubmit={this.updateRange}>
                    <fieldset className="crash-map-charts-fieldset" form="crash-map-update-range">
                        <legend>Select Date Range: </legend>

                        <label htmlFor="from">From: </label>
                        <select id="crash-select-from" name="from" className="crash-map-first-input hover-btn">
                            <option value="2014">2014</option>
                            <option value="2015">2015</option>
                            <option value="2016">2016</option>
                            <option value="2017">2017</option>
                            <option value="2018">2018</option>
                        </select>

                        <label htmlFor="to">To: </label>
                        <select name="to" className="hover-btn">
                            <option value="2018">2018</option>
                            <option value="2017">2017</option>
                            <option value="2016">2016</option>
                            <option value="2015">2015</option>
                            <option value="2014">2014</option>
                        </select>

                        <button id="crash-range-button" className="hover-btn" type="submit">Update</button>
                    </fieldset>
                </form>

                <form className="crash-map-charts-form" id="crash-map-update-type" onSubmit={this.updateCrashType}>
                    <fieldset className="crash-map-charts-fieldset" form="crash-map-update-type">
                        <legend>Select Severity Type: </legend>

                        <label htmlFor="ksi">KSI: </label>
                        <input type="radio" value="ksi" name="crashType" className="crash-map-first-input hover-btn" defaultChecked></input>

                        <label htmlFor="all">All: </label>
                        <input type="radio" value="all" name="crashType" className="hover-btn"></input>

                        <button id="crash-range-button" className="hover-btn" type="submit">Update</button>
                    </fieldset>
                </form>

                <hr id="sidebar-hr" />

                <h2 id="first-subheader" className="centered-text crash-map-sidebar-subheader">Totals</h2>
                    <ul id="crash-map-sidebar-ul">
                        <li><span className="crash-map-sidebar-totals">Crashes</span> <strong>{totals.crashes}</strong></li>
                        <li><span className="crash-map-sidebar-totals">Fatalities</span><strong>{totals.fatalities}</strong></li>
                        <li><span className="crash-map-sidebar-totals">Severe Injuries</span> <strong>{totals.severe}</strong></li>
                        <li><span className="crash-map-sidebar-totals">Pedestrians</span> <strong>{totals.peds}</strong></li>
                        <li><span className="crash-map-sidebar-totals">Bicyclists</span> <strong>{totals.bikes}</strong></li>
                    </ul>

                <h2 className="centered-text crash-map-sidebar-subheader">Crashes Over Time</h2>
                    <Line data={data.trendChart} options={trendOptions}/>
                    <p className="sidebar-paragraphs">This chart shows <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{from}</strong> to <strong>{to}</strong>. Crash trends can be useful for identifying if the frequency of crashes is increasing or decreasing over time, but it is important not to infer patterns from single-year spikes or drops in crashes or in datasets with limited data points.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Injury Severity</h2>
                    <Bar data={data.severityChart} options={severityOptions}/>
                    <p className="sidebar-paragraphs">This chart shows <em>people</em> involved in <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{from}</strong> to <strong>{to}</strong>. Injury severity is divided into seven possible categories, as defined in the "About" section of the information modal. You can access it by clicking on the "info" button next to the DVRPC logo on the navbar.</p>

                <h2 className="centered-text crash-map-sidebar-subheader">Mode</h2>
                    <Doughnut data={data.modeChart} />
                    <p className="sidebar-paragraphs">This chart shows <em>people</em> involved in <strong>{crashType}</strong> crashes in the <strong>{area}</strong> by mode from <strong>{from}</strong> to <strong>{to}.</strong> Pedestrians and bicyclists are often a focus of transportation safety planning efforts because they are the road users most vulnerable to severe injuries in the event of a crash. This is reflected in data that consistently shows pedestrians account for a disproportionate number of the injuries sustained on the road.</p>
                
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
        polygonBbox: state.polygonBbox
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getCrashData: region => dispatch(getDataFromKeyword(region)),
        setCrashTypeFilter: filter => dispatch(sidebarCrashType(filter)),
        setCrashRange: range => dispatch(sidebarRange(range)),
        setSrc: src => dispatch(setSrc(src))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
