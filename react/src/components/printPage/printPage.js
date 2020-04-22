import React, { Component } from 'react';
import { connect } from 'react-redux'
import PrintTemplate from 'react-print';

import * as charts from '../sidebar/charts.js'
import './printPage.css';

class PrintPage extends Component {
    componentDidMount() {

    }
    render() {

        // set dynamic text
        let area = this.props.context
        let crashType = this.props.crashType
        const range = this.props.range || {from: 2014, to: 2018}
        const from = range.from
        const to = range.to
        let chartsRange = {from, to}

        // draw charts
        const data = charts.makeCharts(this.props.data, chartsRange)

        // @INFO needed: 
            // dataets[0][index] for VALUES
            // labels[index] for LABELS
        const trend = data.trendChart
        const trendData = trend.datasets[0].data
        const trendLabels = trend.labels

        const severity = data.severityChart
        const severityData = severity.datasets[0].data
        const severityLabels = severity.labels

        const mode = data.modeChart
        const modeData = mode.datasets[0].data
        const modeLabels = mode.Labels

        const collisionType = data.collisionTypeChart
        const collisionTypeData = collisionType.datasets[0].data
        const colissionLabels = collisionType.Labels

        return(
            <PrintTemplate>
                <section id="print-sidebar">
                <h1 className="centered-text">Crash Statistics for {area}</h1>
                <p className="sidebar-paragraphs">This tool's default setting is limited to five years of killed and severe injury crashes (abbreviated as "KSI") for 2014 to 2018. This dataset is also used by our state and local partners.</p>
                <p className="sidebar-paragraphs">The following tables and map are showing results for <strong>{crashType}</strong> crash types from <strong>{from}</strong> to <strong>{to}</strong>.</p>
        
                <hr id="sidebar-hr" />

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
                                <th>Fatal: </th>
                                <th>Major: </th>
                                <th>Moderate: </th>
                                <th>Minor: </th>
                                <th>Uninjured: </th>
                                <th>Unknown: </th>
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
                    {/* <Doughnut data={data.modeChart} /> */}
                    <p className="sidebar-paragraphs">This table shows <em>people</em> involved in <strong>{crashType}</strong> crashes in the <strong>{area}</strong> by mode from <strong>{from}</strong> to <strong>{to}.</strong> Pedestrians and bicyclists are often a focus of transportation safety planning efforts because they are the road users most vulnerable to sever injuries in the event of a crash. This is reflected in data that consistently shows pedestrians account for a disproportionate number of the injuries sustained on the road.</p>
                
                <h2 className="centered-text crash-map-sidebar-subheader">Collision Type</h2>
                    {/* <Doughnut data={data.collisionTypeChart} /> */}
                    <p className="sidebar-paragraphs">This table shows <strong>{crashType}</strong> <em>crashes</em> in <strong>{area}</strong> by collision type from <strong>{from}</strong> to <strong>{to}</strong>. Collision type data can be especially useful for identifying trends at specific locations or along specific routes.</p>
            </section>
            </PrintTemplate>
        )
    }
}

// @TODO: add dispatchToProps for context + API response 
const mapStateToProps = state => {
    return {
        data: state.data,
        context: state.area,
        range: state.range,
        crashType: state.crashType
    }   
}

export default connect(mapStateToProps, null)(PrintPage);