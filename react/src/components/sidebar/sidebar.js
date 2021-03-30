import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import {counties, munis, philly } from '../search/dropdowns'
import * as charts from './charts.js'
import Footer from '../footer/footer.js'
import print from './print.png'
import { getDataFromKeyword, sidebarCrashType, sidebarRange, setSrc, setMapLoading } from '../../redux/reducers/mapReducer.js'
import './sidebar.css';


class Sidebar extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: 'default',
            context: 'the DVRPC region',
            crashType: 'KSI',
            from: 2014,
            to: 2018,
            loading: this.props.mapLoading
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

        // update data and set crashType state
        if(selected !== this.state.crashType) {
            let context = this.props.context || this.state.context
            let isKSI = selected === 'KSI' ? 'yes' : 'no'

            // return special case for regional stats
            if(context === 'the DVRPC region') {
                this.setState({crashType: selected, data: 'calc'})
                this.props.getCrashData({geoID: '', isKSI})
                return
            } else {
                
            }

            // handle  Philly being both a county and muni
            if(context === 'Philadelphia City') context = 'Philadelphia County'

            let nameArr = context.split(' ')
            const lastWord = nameArr.pop()
            let isCounty = lastWord === 'County' ? true : false
            let isPPA = lastWord === 'Philadelphia' ? true : false
            nameArr = nameArr.join(' ')

            let geoID;
            let geojson;
            const bbox = this.props.polygonBbox

            // assign values to geoId and geojson
            if(isCounty) geoID = counties[nameArr]
            else if(isPPA) geoID = philly[nameArr + ' Philadelphia']
            else geoID = munis[context]

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
        // default response
        let totalsObj = {crashes: 'calculating...', fatalities: 'calculating...', severe: 'calculating...', peds: 'calculating...', bikes: 'calculating...'}
        
        // formatted results response
        if(data === 'empty') {
            totalsObj = {crashes: 0, fatalities: 0, severe: 0, peds: 0, bikes: 0}
        }
        else if(data && data.crashes.length) {
            totalsObj.crashes = data.crashes.reduce((total, num) => total + num).toLocaleString()
            totalsObj.fatalities = data.severity[0].toLocaleString()
            totalsObj.severe = data.severity[1].toLocaleString()
            totalsObj.peds = data.mode[1].toLocaleString()
            totalsObj.bikes = data.mode[0].toLocaleString()
        }

        return totalsObj
    }

    // shallow compare the first layer of objects. expects a nested object
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
        let checkOld = prevProps.data && prevProps.data.message ? false : prevProps.data
        
        // @REMINDER: this is a workaround to the API handling all 0's as a null response instead of a possible outcome
        // 'empty' state is to differentiate between no response (intial render) and empty response (no crashes in selected area)
        let checkNew = this.props.data.message ? false : this.props.data
        const current = this.state.data
        
        // handle default state
        if(checkNew && current === 'default') this.setState( {data: this.props.data} )
        // handle updated state
        else if(checkNew) {
            let areEqual = checkOld ? this.compare(checkNew, checkOld) : false
            if(!areEqual) this.setState( { data: this.props.data} )
        }
        // handle all 0 crash response
        else if(!checkNew && current !== 'empty') {
            this.setState( {data: 'empty'} )
        }
    }

    render() {
        // set dynamic text
        let area = this.props.context || this.state.context
        const areaHeader = area.toUpperCase()
        let crashType = this.state.crashType
        let from = this.state.from
        let to = this.state.to
        let chartsRange = {from, to}
        let data = this.state.data;
        let totals;
        let chartHeight = window.innerWidth > 800 ? 200 : 187.5

        // populate chart data
        if(data && data !== 'empty'){
            data = charts.makeCharts(data, chartsRange)
            const dataFormatted = {crashes: data.trendChart.datasets[0].data, severity: data.severityChart.datasets[0].data, mode: data.modeChart.datasets[0].data}
            totals = this.getTotals(dataFormatted)
            
        }else{
            // handle undefined data (nonexistant or all 0 response both get lumped into here)
            totals = data === 'empty' ? this.getTotals(data) : this.getTotals()
            data = charts.makeCharts(null, chartsRange)
        }

        const severityOptions = charts.chartOptions('Injury type', 'Number of persons', {bottom: 15})
        const trendOptions = charts.chartOptions('', 'Number of Crashes')
        const doughnutOptions = charts.doughnutTooltipOptions()

        return (
            <div id="sidebar-wrapper">
                <section id="sidebar" className="no-print">
                
                <header id="crash-map-sidebar-header">
                    <div>
                        <h1 className="centered-text"><span id="crash-map-sidebar-header-main">Crash Statistics</span><span id="crash-map-sidebar-header-area">FOR {areaHeader}</span></h1>
                    </div>
                </header>
                
                <span id="crash-map-print-sidebar" onClick={this.setSrc}><img id="crash-map-print-icon" src={print} alt="print stats icon" /> print statistics</span>
                
                <p className="sidebar-paragraphs first-paragraph">This tool's default setting is limited to five years of killed and severe injury crashes (abbreviated as "KSI") for 2014 to 2018. Five years of data is typically used by local, state, and federal partners in safety analyses.</p>
                <p className="sidebar-paragraphs">The following charts and map are showing results for <strong>{crashType}</strong> crash types from <strong>{from}</strong> to <strong>{to}</strong> in <strong>{area}</strong>. You can adjust the range and severity type using the forms below.</p>

                <hr id="sidebar-hr" />

                <form className="crash-map-charts-form" id="crash-map-update-range" onSubmit={this.updateRange}>
                    <fieldset className="crash-map-charts-fieldset" form="crash-map-update-range">
                        <legend>Select Date Range: </legend>

                        <div className="crash-map-fieldset-subgroup">
                            <div className="crash-map-label-subgroup">
                                <label>
                                    From: 
                                    <select id="crash-select-from" name="from" className="crash-map-first-input hover-btn">
                                        <option value="2014">2014</option>
                                        <option value="2015">2015</option>
                                        <option value="2016">2016</option>
                                        <option value="2017">2017</option>
                                        <option value="2018">2018</option>
                                    </select>
                                </label>

                                <label>
                                    To:
                                    <select name="to" className="hover-btn">
                                        <option value="2018">2018</option>
                                        <option value="2017">2017</option>
                                        <option value="2016">2016</option>
                                        <option value="2015">2015</option>
                                        <option value="2014">2014</option>
                                    </select>
                                </label>
                            </div>
                            
                            <button className="hover-btn crash-sidebar-toggle-button" type="submit">update</button>
                        </div>
                    </fieldset>
                </form>

                <form className="crash-map-charts-form" id="crash-map-update-type" onSubmit={this.updateCrashType}>
                    <fieldset className="crash-map-charts-fieldset" form="crash-map-update-type">
                        <legend>Select Severity Type: </legend>

                        <div className="crash-map-fieldset-subgroup">
                            <div className="crash-map-label-subgroup">
                                <label>
                                    KSI
                                    <input type="radio" value="KSI" name="crashType" className="crash-map-first-input hover-btn crash-map-input" defaultChecked></input>
                                </label>

                                <label>
                                    All
                                    <input type="radio" value="All" name="crashType" className="hover-btn crash-map-input"></input>
                                </label>
                            </div>

                            <button className="hover-btn crash-sidebar-toggle-button" type="submit">update</button>
                        </div>
                    </fieldset>
                </form>

                <h2 id="first-subheader" className="centered-text crash-map-sidebar-subheader">Totals</h2>
                    <ul id="crash-map-sidebar-ul">
                        <li><span className="crash-map-sidebar-totals">Crashes</span> <strong>{totals.crashes}</strong></li>
                        <li><span className="crash-map-sidebar-totals">Fatalities</span><strong>{totals.fatalities}</strong></li>
                        <li><span className="crash-map-sidebar-totals">Suspected Serious Injuries</span> <strong>{totals.severe}</strong></li>
                        <li><span className="crash-map-sidebar-totals">Pedestrians Involved</span> <strong>{totals.peds}</strong></li>
                        <li><span className="crash-map-sidebar-totals">Bicyclists Involved</span> <strong>{totals.bikes}</strong></li>
                    </ul>

                <h2 className="centered-text crash-map-sidebar-subheader">Crashes Over Time</h2>
                    <div className="chart-wrapper">
                        <Line data={data.trendChart} options={trendOptions} id="trend-chart" />
                        <div className="sidebar-chart-paragraphs">
                            <p className="sidebar-paragraphs">This chart shows <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{from}</strong> to <strong>{to}</strong>. Crash trends can be useful for identifying if the frequency of crashes is increasing or decreasing over time, but it is important not to infer patterns from single-year spikes or drops in crashes or in datasets with limited data points.</p>
                        </div>
                    </div>

                <h2 className="centered-text crash-map-sidebar-subheader">Injury Severity</h2>
                    <div className="chart-wrapper">
                        <Bar data={data.severityChart} options={severityOptions} id="severity-chart" height={chartHeight} />
                        <div className="sidebar-chart-paragraphs">
                            <p className="sidebar-paragraphs">This chart shows <em>people</em> involved in <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{from}</strong> to <strong>{to}</strong>. Injury severity is divided into seven possible categories, as defined in the "About" section of the information modal. You can access it by clicking on the "info" button next to the DVRPC logo on the navbar.</p>
                        </div>
                    </div>

                <h2 className="centered-text crash-map-sidebar-subheader">Mode</h2>
                    <div className="chart-wrapper">
                        <Doughnut data={data.modeChart} options={doughnutOptions} id="mode-chart" />
                        <div className="sidebar-chart-paragraphs">
                            <p className="sidebar-paragraphs">This chart shows <em>people</em> involved in <strong>{crashType}</strong> crashes in the <strong>{area}</strong> by mode from <strong>{from}</strong> to <strong>{to}.</strong> Pedestrians and bicyclists are often a focus of transportation safety planning efforts because they are the road users most vulnerable to severe injuries in the event of a crash. This is reflected in data that consistently shows pedestrians account for a disproportionate number of the injuries sustained on the road.</p>
                        </div>
                    </div>
                
                <h2 className="centered-text crash-map-sidebar-subheader">Collision Type</h2>
                    <div className="chart-wrapper">
                        <Doughnut data={data.collisionTypeChart} options={doughnutOptions} id="collision-chart" height={chartHeight} />
                        <div className="sidebar-chart-paragraphs">
                            <p className="sidebar-paragraphs">This chart shows <strong>{crashType}</strong> <em>crashes</em> in <strong>{area}</strong> by collision type from <strong>{from}</strong> to <strong>{to}</strong>. Collision type data can be especially useful for identifying trends at specific locations or along specific routes.</p>
                        </div>
                    </div>

                <Footer />
            </section>
        </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        data: state.data,
        context: state.area,
        polygonBbox: state.polygonBbox,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getCrashData: region => dispatch(getDataFromKeyword(region)),
        setCrashTypeFilter: filter => dispatch(sidebarCrashType(filter)),
        setCrashRange: range => dispatch(sidebarRange(range)),
        setSrc: src => dispatch(setSrc(src)),
        setMapLoading: status => dispatch(setMapLoading(status))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
