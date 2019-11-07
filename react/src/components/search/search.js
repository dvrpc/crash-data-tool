import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getDataFromKeyword, setMapCenter, setMapBounding, setSidebarHeaderContext, getBoundingBox, setMapFilter } from '../../redux/reducers/mapReducer.js'
import * as form from './handleForm.js'

import './search.css'

// @TODO for store filter:
/* 
    dispatch to the store
*/

class Search extends Component {
    constructor(props){
        super(props)
        this.state = {
            selectedSearch: ['Pennsylvania', 'New Jersey']
        }
    }
    
    selectSearch = e => {
        const value = e.target.value
        const selectedSearch = form.handleSelect(value)

        this.setState({selectedSearch})
    }

    submitSearch = e => {
        const output = form.submitSearch(e)

        // @TODO: short out for state searches for now since they aren't real yet (API response isn't set up for these yet)
        if(output.state) {
            alert('search by state isnt set up yet, please try again with municipalities, counties or address')
            return
        }

        // push the new map center when applicable
        if(output.coords) {
            output.coords.then(result => {
                const center = result.features[0].center
                this.props.setMapCenter(center)
            })
        }

        // hit the api's to get sidebar info (if applicable)
        if(output.boundary.name){
            const boundary = output.boundary

            let decodedName = boundary.type === 'county' ? decodeURI(boundary.name) + ' County' : decodeURI(boundary.name)
            let tileType = boundary.type[0]

            // let map local state fill in the correct filterType
            const filterObj = {filterType: '', tileType, id: boundary.id}
            
            // add filter obj to boundary obj
            boundary.filter = filterObj
                        
            // dispatch actions to: set sidebar header, fetch the data and create a bounding box for the selected area
            this.props.setSidebarHeaderContext(decodedName)
            this.props.getData(boundary)
            this.props.setMapBounding(boundary)
            this.props.getBoundingBox(boundary.id)
        }
    }

    render() {
        const selectedSearch = this.state.selectedSearch

        return (
            <form id="search-form" onSubmit={ this.submitSearch }>
                <fieldset className="search-form-fieldset" name="type" form="search-form">
                    <label id="seearch-by-label" htmlFor="select-search-type">Search By: </label>
                    <select name="type" id="select-search-type" onChange={ this.selectSearch }>
                        <option value="state">State</option>
                        <option value="county">County</option>
                        <option value="municipality">Municipality</option>
                        <option value="address">Address</option>
                    </select>
                </fieldset>
                {selectedSearch ? (
                    <fieldset className="search-form-fieldset" name="boundary" form="search-form">
                        <select name="boundary" id="search-type">
                            { selectedSearch.map(e => <option key={e}>{e}</option>) }
                        </select>
                    </fieldset>
                    ) : (
                    <fieldset className="search-form-fieldset" name="address" form="search-form">
                        <input name="address" type="text" />
                    </fieldset>
                    )
                }
                <input type="submit" value="search" />
            </form>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getData: boundaryObj => dispatch(getDataFromKeyword(boundaryObj)),
        setMapCenter: coords => dispatch(setMapCenter(coords)),
        setMapBounding: boundingObj => dispatch(setMapBounding(boundingObj)),
        setSidebarHeaderContext: area => dispatch(setSidebarHeaderContext(area)),
        getBoundingBox: id => dispatch(getBoundingBox(id)),
        setMapFilter: filter => dispatch(setMapFilter(filter))
    }
}

export default connect(null, mapDispatchToProps)(Search);