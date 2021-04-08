import React, { Component } from 'react';
import { connect } from 'react-redux'
import PrintTemplate from 'react-print';

import { setSrc } from '../../redux/reducers/mapReducer.js'
import * as charts from '../sidebar/charts.js';
import './printPage.css';

class PrintPage extends Component {
    componentDidUpdate() {
        if(this.props.src) {
            // print and then clear src from store
            this.mapImg.setAttribute('src', this.props.src)
            window.print()
            this.props.setSrc(null)
        }
    }

    render() {
        // set dynamic text
        let area = this.props.area || 'the DVRPC Region'
        let crashType = this.props.crashType || 'KSI'
        const range = this.props.range || {from: 2014, to: 2019}
        const from = range.from
        const to = range.to
        let chartsRange = {from, to}

        // get and organize data
        const data = charts.makeCharts(this.props.data, chartsRange)

        const trend = data.trendChart
        const trendData = trend.datasets[0].data
        const trendLabels = trend.labels

        const severity = data.severityChart
        const severityData = severity.datasets[0].data
        const severityLabels = severity.labels

        const mode = data.modeChart
        const modeData = mode.datasets[0].data
        const modeLabels = mode.labels

        const collisionType = data.collisionTypeChart
        const collisionTypeData = collisionType.datasets[0].data
        const collissionTypeLabels = collisionType.labels

        return(
            <PrintTemplate>
                <section id="print-section">
                    <img id="print-map" alt="map of extent" ref={el => this.mapImg = el} />
                    <h1 className="centered-text print-header">Crash Statistics for {area}</h1>
                    <p className="sidebar-paragraphs">This tool's default setting is limited to five years of killed and severe injury crashes (abbreviated as "KSI") for 2014 to 2019. Five years of data is typically used by local, state, and federal partners in safety analyses.</p>
                    <p className="sidebar-paragraphs">The following tables are showing results for <strong>{crashType}</strong> crash types from <strong>{from}</strong> to <strong>{to}</strong>.</p>
                    <p>Raw crash data tables for this tool were downloaded from the <a href="https://pennshare.maps.arcgis.com/apps/webappviewer/index.html?id=8fdbf046e36e41649bbfd9d7dd7c7e7e" target="_blank" rel="noopener noreferrer">PennDOT Crash Download Map</a> and the <a href="https://www.state.nj.us/transportation/refdata/accident/rawdata01-current.shtm" target="_blank" rel="noopener noreferrer">NJDOT Crash Tables</a> webpage, for Pennsylvania and New Jersey data, respectively.</p>
            
                    <hr />

                    <h2 className="centered-text crash-map-sidebar-subheader">Crashes over Time</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Year: </th>
                                    <th>Number of Crashes: </th>
                                </tr>
                            </thead>
                            <tbody>
                                {trendData.map((data, index) => {
                                    return(
                                        <tr key={`trend year ${trendLabels[index]}`}>
                                            <td>{trendLabels[index]}</td>
                                            <td>{data.toLocaleString()}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <p className="sidebar-paragraphs">This table shows <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{from}</strong> to <strong>{to}</strong>. Crash trends can be useful for identifying if the frequency of crashes is increasing or decreasing over time, but it is important not to infer patterns from single-year spikes or drops in crashes or in datasets with limited data points.</p>

                    <h2 className="centered-text crash-map-sidebar-subheader">Crash Severity</h2>
                        <table>
                            <thead>
                                <tr>
                                    {severityLabels.map((data => <th key={data}>{data}</th>))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {severityData.map(((data, index) => <td key={`severity type ${severityLabels[index]}`}>{data.toLocaleString()}</td>))}
                                </tr>
                            </tbody>
                        </table>
                        <p className="sidebar-paragraphs">This table shows <em>people</em> involved in <strong>{crashType}</strong> crashes in <strong>{area}</strong> by crash severity from <strong>{from}</strong> to <strong>{to}</strong>. Injury severity is divided into seven possible categories, as defined in the "About" section of the information modal.</p>

                    <h2 className="centered-text crash-map-sidebar-subheader">Mode</h2>
                        <table>
                            <thead>
                                <tr>
                                    {modeLabels.map((data => <th key={data}>{data}</th>))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {modeData.map(((data, index) => <td key={`mode type ${modeLabels[index]}`}>{data.toLocaleString()}</td>))}
                                </tr>
                            </tbody>
                        </table>
                        <p className="sidebar-paragraphs">This table shows <em>people</em> involved in <strong>{crashType}</strong> crashes in the <strong>{area}</strong> by mode from <strong>{from}</strong> to <strong>{to}.</strong> Pedestrians and bicyclists are often a focus of transportation safety planning efforts because they are the road users most vulnerable to sever injuries in the event of a crash. This is reflected in data that consistently shows pedestrians account for a disproportionate number of the injuries sustained on the road.</p>
                    
                    <h2 className="centered-text crash-map-sidebar-subheader">Collision Type</h2>
                        <table>
                            <thead>
                                <tr>
                                    {collissionTypeLabels.map((data => <th key={data}>{data}</th>))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {collisionTypeData.map(((data, index) => <td key={`collision type ${collissionTypeLabels[index]}`}>{data.toLocaleString()}</td>))}
                                </tr>
                            </tbody>
                        </table>
                        <p className="sidebar-paragraphs">This table shows <strong>{crashType}</strong> <em>crashes</em> in <strong>{area}</strong> by collision type from <strong>{from}</strong> to <strong>{to}</strong>. Collision type data can be especially useful for identifying trends at specific locations or along specific routes.</p>
                </section>
            </PrintTemplate>
        )
    }
}

const mapStateToProps = state => {
    return {
        data: state.data,
        area: state.area,
        range: state.range,
        crashType: state.crashType,
        src: state.src
    }   
}

const mapDispatchToProps = dispatch => {
    return {
        setSrc: src => dispatch(setSrc(src))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintPage);