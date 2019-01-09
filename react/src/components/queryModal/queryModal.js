import React, { Component } from 'react';
import gql from 'graphql-tag'
import ApolloClient from 'apollo-boost'

import './queryModal.css'

// Most of this will be refactored to outside of queryModal, but here for now just to get it working
const client = new ApolloClient({
    uri: "http://localhost:4000/graphql"
})

// for each instance of MAX_SEVERI, build out nearly identical queries w/different MAX_SEVERI parameters
    // NOT using fragments here because all the different combination types - from the standard options to the advanced options
const buildQueryLogic = params => {
    let queries = '{';
    const crashSeverity = params.severity
    
    // eventually want this to be smart enough to populate the COUNTY, COLLISION, etc., based on what the params are
    crashSeverity.forEach(severity => {
        let query = `
            ${severity.alias}: crashes(MAX_SEVERI: "${severity.value}"){
                MAX_SEVERI,
                COUNTY,
                COLLISION {
                    ${[...params.collisions]}
                },
                VEHICLE_CO {
                    ${[...params.vehicles]}
                }
            },`

        queries += query
    })

    queries += '}'

    return queries
}

// use the constructed query strings to make a call
const buildCrashQuery = queries => {
    client.query({
        query: gql(queries)
    }).then(result => console.log('form query result ', result))
}

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

    // @TODO: this needs to communicate w/navbar.js to let it know it has to reset this.state.viewModal to false
    ariaHideModal = () => {
        const modal = this.modal
        modal.style.display = 'none'
        modal.setAttribute('aria-hidden', 'true')
    }

    submitForm = e => {
        e.preventDefault()
        const data = new FormData(e.target)
        
        // form data is a weird object that doesn't let you inspect or view the key/value pairs it generates. Logging it will appear empty so you have to do a for/in to inspect the contents
        // this logs the key (name) and value (value) of only the selected form elements
        let alias;
        const params = {
            severity: [],
            vehicles: [],
            collisions: []
        }

        for(var [key, value] of data.entries()) {
            switch(key){
                // create a new entry in queryObjs for each selected MAX_SEVERI field
                case 'MAX_SEVERI':
                    // type aliases cannot have spaces, so just take the first word
                    alias = value.split(' ')[0]
                    const severityObj = {alias, value}
                    params.severity.push(severityObj)
                    break
                // assign the rest of the fields
                case 'COLLISION_':
                    params.collisions.push(value)
                    break
                case 'VEHICLE_CO':
                    params.vehicles.push(value)
                    break
                default:
                    console.log('default')
            }
        }

        // build and then execute the query
        const queries = buildQueryLogic(params)
        buildCrashQuery(queries)
    }

    showAdvancedSearchOptions = e => {
        e.preventDefault()
        this.advancedSearch.textContent = 'clicking here will reveal all the advanced search options'
    }

    componentDidMount() {
        // reveal the modal based on state from navbar button
        this.props.show ? this.ariaShowModal() : this.ariaHideModal()

        // let users click anywhere outside the modal to close it
        window.onclick = e => e.target === this.modal ? this.ariaHideModal() : null
    }

    render() {
        return (
            <div id="modal" role="dialog" ref={el => this.modal = el}>
                <div id="modal-content">
                    <span id="close-modal" onClick={this.ariaHideModal}>&times;</span>

                    <form id="new-crash-query" onSubmit={this.submitForm}>
                        <fieldset name="query-severity" className="crash-query-subgroup" form="new-crash-query">
                            <legend className="crash-query-subheader">Crash Severity</legend>
                            <input type="checkbox" value="Killed" name="MAX_SEVERI" />Major Injury<br />
                            <input type="checkbox" value="Moderate injury" name="MAX_SEVERI" />Moderate Injury<br />
                            <input type="checkbox" value="Minor injury" name="MAX_SEVERI" />Minor Injury<br />
                            <input type="checkbox" value="unknown injury" name="MAX_SEVERI" />Injury (unknown severity)<br />
                            <input type="checkbox" value="no injury" name="MAX_SEVERI" />Not Injured<br />
                            <input type="checkbox" value="unknown" name="MAX_SEVERI" />Unknown<br />
                        </fieldset>

                        <fieldset name="query-county" className="crash-query-subgroup" form="new-crash-query">
                            <legend className="crash-query-subheader">County</legend>
                            <select className="crash-query-select">
                                <option value="COUNTY" name="Bucks">Bucks</option>
                                <option value="COUNTY" name="Montgomery">Montgomery</option>
                                <option value="COUNTY" name="Chester">Chester</option>
                                <option value="COUNTY" name="Delaware">Delaware</option>
                            </select>
                        </fieldset>

                        <fieldset name="query-type" className="crash-query-subgroup" form="new-crash-query">
                            <legend className="crash-query-subheader">Collision Type:</legend>
                            <input type="checkbox" name="COLLISION_" value="NonCollision" />Non-collision<br />
                            <input type="checkbox" name="COLLISION_" value="RearEnd" />Rear-end<br />
                            <input type="checkbox" name="COLLISION_" value="HeadOn" />Head-on<br />
                            <input type="checkbox" name="COLLISION_" value="RearToRearBacking" />Rear-to-rear (Backing)<br />
                            <input type="checkbox" name="COLLISION_" value="Angle" /> Angle <br />
                            <input type="checkbox" name="COLLISION_" value="SideswipeSameDir" /> Sideswipe (same dir.) <br />
                            <input type="checkbox" name="COLLISION_" value="SideswipeOppositeDir" /> Sideswipe (Opposite dir.) <br />
                            <input type="checkbox" name="COLLISION_" value="HitFixedObject" /> Hit fixed object <br />
                            <input type="checkbox" name="COLLISION_" value="HitPedestrian" /> Hit pedestrian <br />
                            <input type="checkbox" name="COLLISION_" value="OtherUnknown" /> Other or unknown
                        </fieldset>

                        <fieldset name="query-vehicleCo" className="crash-query-subgroup" form="new-crash-query">
                            <legend className="crash-query-subheader">Number of Vehicles Involved</legend>
                                <input type="checkbox" name="VEHICLE_CO" value="AUTOMOBILE" />Automobile<br />
                                <input type="checkbox" name="VEHICLE_CO" value="MOTORCYCLE" />Motorcycle<br />
                                <input type="checkbox" name="VEHICLE_CO" value="BUS_COUNT" />Bus<br />
                                <input type="checkbox" name="VEHICLE_CO" value="SMALL_TRUC" />Small Truck<br />
                                <input type="checkbox" name="VEHICLE_CO" value="HEAVY_TRUC" />Large Truck<br />
                                <input type="checkbox" name="VEHICLE_CO" value="SUV_COUNT" />SUV<br />
                                <input type="checkbox" name="VEHICLE_CO" value="VAN_COUNT" />Van<br />
                                <input type="checkbox" name="VEHICLE_CO" value="BICYLE_CO" />Bicycle<br />
                                {/* <input type="checkbox" name="VEHICLE_CO" value="" />ATV<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Other Type Special Vehicle<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Unknown Type Special Vehicle<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Unicycle, Bicycle or Tricycle<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Other Pedacycle<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Horse and Buggy<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Horse and Rider<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Train<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Trolley<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Other Vehicle<br />
                                <input type="checkbox" name="VEHICLE_CO" value="" />Unknown Vehicle<br /> */}
                        </fieldset>

                        <fieldset name="query-count" className="crash-query-subgroup" form="new-crash-query">
                            <legend className="crash-query-subheader">Person Count</legend>
                            <select className="crash-query-select">
                                <option value="PERSON_COU" name="test7">0-5</option>
                                <option value="PERSON_COU" name="test8">6-10</option>
                                <option value="PERSON_COU" name="test9">11-15</option>
                                <option value="PERSON_COU" name="test10">16-20</option>
                                <option value="PERSON_COU" name="test11">21-25</option>
                            </select>
                        </fieldset>

                        <button onClick={this.showAdvancedSearchOptions} ref={el => this.advancedSearch = el} id="advanced-search">Advanced Search</button>

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

//         </div>
//     </div>
// </section>