import React, { Component } from 'react';

import './queryModal.css'

// refactor to our own modal b/c of the form
class QueryModal extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    ariaShowModal = () => {
        const modal = this.modal
        modal.style.display = 'block'
        modal.setAttribute('aria-hidden', 'false')
    }

    ariaHideModal = () => {
        const modal = this.modal
        modal.style.display = 'none'
        modal.setAttribute('aria-hidden', 'true')
    }

    submitForm = options => {
        console.log('options from submitForm ', options)
    }

    componentDidMount() {
        // reveal the modal based on state from navbar button
        this.props.show ? this.ariaShowModal() : this.ariaHideModal()

        // let users click anywhere outside the modal to close it
        window.onclick = e => e.target === this.modal ? this.ariaHideModal() : null
    }

    componentDidUpdate() {
        console.log('show props ', this.props)
    }

    render() {
        return (
            <div id="modal" role="dialog" ref={el => this.modal = el}>
                <div id="modal-content">
                    <span id="close-modal" onClick={this.ariaHideModal}>&times;</span>

                    <form id="new-crash-query" onSubmit={this.submitForm}>
                        <section className="crash-query-subgroup">
                            <div>
                                <p className="crash-query-subheader">Collision Type</p>
                                <div id="query-type">
                                    <input type="checkbox" value="non collision" />Non-collision<br />
                                    <input type="checkbox" value="rear-end" />Rear-end<br />
                                    <input type="checkbox" value="head-on" />Head-on<br />
                                    <input type="checkbox" value="rear-to-rear (backing)" />Rear-to-rear (Backing)<br />
                                    <input type="checkbox" value="" /> Angle <br />
                                    <input type="checkbox" value="" /> Sideswipe (same dir.) <br />
                                    <input type="checkbox" value="" /> Sideswipe (Opposite dir.) <br />
                                    <input type="checkbox" value="" /> Hit fixed object <br />
                                    <input type="checkbox" value="" /> Hit pedestrian <br />
                                    <input type="checkbox" value="" /> Other or unknown
                                </div>
                            </div>

                            <div>
                                <p className="crash-query-subheader">Crash Severity</p>
                                <div id="query-severity">
                                    <input type="checkbox" value="major injury" />Major Injury<br />
                                    <input type="checkbox" value="moderate injury" />Moderate Injury<br />
                                    <input type="checkbox" value="minor injury" />Minor Injury<br />
                                    <input type="checkbox" value="unknown injury" />Injury (unknown severity)<br />
                                    <input type="checkbox" value="no injury" />Not Injured<br />
                                    <input type="checkbox" value="unknown" />Unknown<br />
                                </div>
                            </div>
                        
                            <div>
                                <p className="crash-query-subheader">Location</p>
                                <div id="query-location">
                                    <select>
                                        <option value="">load</option>
                                        <option value="">locations</option>
                                        <option value="">from</option>
                                        <option value="">an</option>
                                        <option value="">API</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <input type="submit" value="Submit Query" id="query-submit" />
                    </form>
                </div>
            </div>
        )
    }
}

export default QueryModal

// might need this later: 
// <hr />

// <section className="crash-query-subgroup">
//     <div>
//         <p className="crash-query-subheader">Road Conditions</p>
//         <div id="query-road-condition">
//             <input type="checkbox" value="" />Dry<br />
//             <input type="checkbox" value="" />Wet<br />
//             <input type="checkbox" value="" />Sand/ Mud/ Dirt/ Oil or Grav<br />
//             <input type="checkbox" value="" />Snow Covered<br />
//             <input type="checkbox" value="" />Slush<br />
//             <input type="checkbox" value="" />Ice<br />
//             <input type="checkbox" value="" />Ice Patches<br />
//             <input type="checkbox" value="" />Water - standing or moving<br />
//             <input type="checkbox" value="" />Other<br />
//         </div>
//     </div>

//     <div>
//         <p className="crash-query-subheader">Weather</p>
//         <div id="query-weather">
//             <input type="checkbox" value="" />No adverse conditions<br />
//             <input type="checkbox" value="" />Rain<br />
//             <input type="checkbox" value="" />Sleet (hail)<br />
//             <input type="checkbox" value="" />Snow<br />
//             <input type="checkbox" value="" />Fog<br />
//             <input type="checkbox" value="" />Rain and Fog<br />
//             <input type="checkbox" value="" />Sleet and Fog<br />
//             <input type="checkbox" value="" />Other<br />
//             <input type="checkbox" value="" />Unknown<br />
//         </div>
//     </div>

//     <div>
//         <p className="crash-query-subheader">Illumination</p>
//         <div id="query-illumination">
//             <input type="checkbox" value="" />Daylight<br />
//             <input type="checkbox" value="" />Dark - no street lights<br />
//             <input type="checkbox" value="" />Dark - street lights<br />
//             <input type="checkbox" value="" />Dusk<br />
//             <input type="checkbox" value="" />Dawn<br />
//             <input type="checkbox" value="" />Dark - unknown roadway<br />
//             <input type="checkbox" value="" />Other<br />
//         </div>
//     </div>
// </section>

// <hr />

// <section className="crash-query-subgroup">
//     <div>
//         <p className="crash-query-subheader">Month</p>
//         <div id="query-month">
//             <input type="checkbox" value="" />January<br />
//             <input type="checkbox" value="" />February<br />
//             <input type="checkbox" value="" />March<br />
//             <input type="checkbox" value="" />April<br />
//             <input type="checkbox" value="" />May<br />
//             <input type="checkbox" value="" />June<br />
//             <input type="checkbox" value="" />July<br />
//             <input type="checkbox" value="" />August<br />
//             <input type="checkbox" value="" />September<br />
//             <input type="checkbox" value="" />October<br />
//             <input type="checkbox" value="" />November<br />
//             <input type="checkbox" value="" />December
//         </div>
//     </div>

//     <div>
//         <p className="crash-query-subheader">Year</p>
//         <div id="query-year">
//             <select>
//                 <option value="2016">2016</option>
//                 <option value="2015">2015</option>
//                 <option value="2014">2014</option>
//                 <option value="2013">2013</option>
//                 <option value="2012">2012</option>
//             </select>
//         </div>            
//     </div>

//     <div>
//         <p className="crash-query-subheader">Day of Week</p>
//         <div id="query-day">
//             <input type="checkbox" value="" />Sunday<br />
//             <input type="checkbox" value="" />Monday<br />
//             <input type="checkbox" value="" />Tuesday<br />
//             <input type="checkbox" value="" />Wednesday<br />
//             <input type="checkbox" value="" />Thursday<br />
//             <input type="checkbox" value="" />Friday<br />
//             <input type="checkbox" value="" />Saturday
//         </div>
//     </div>
// </section>

// <hr />

// <section className="crash-query-subgroup">
//     <div>
//         <p className="crash-query-subheader">Vehicle Type</p>
//         <div id="query-vehicle-type">
//             <input type="checkbox" value="" />Automobile<br />
//             <input type="checkbox" value="" />Motorcycle<br />
//             <input type="checkbox" value="" />Bus<br />
//             <input type="checkbox" value="" />Small Truck<br />
//             <input type="checkbox" value="" />Large Truck<br />
//             <input type="checkbox" value="" />SUV<br />
//             <input type="checkbox" value="" />Van<br />
//             <input type="checkbox" value="" />Construction Equipment<br />
//             <input type="checkbox" value="" />ATV<br />
//             <input type="checkbox" value="" />Other Type Special Vehicle<br />
//             <input type="checkbox" value="" />Unknown Type Special Vehicle<br />
//             <input type="checkbox" value="" />Unicycle, Bicycle or Tricycle<br />
//             <input type="checkbox" value="" />Other Pedacycle<br />
//             <input type="checkbox" value="" />Horse and Buggy<br />
//             <input type="checkbox" value="" />Horse and Rider<br />
//             <input type="checkbox" value="" />Train<br />
//             <input type="checkbox" value="" />Trolley<br />
//             <input type="checkbox" value="" />Other Vehicle<br />
//             <input type="checkbox" value="" />Unknown Vehicle<br />
//         </div>
//     </div>
// </section>