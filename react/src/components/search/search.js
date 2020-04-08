import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getDataFromKeyword, setMapCenter, setMapBounding, setSidebarHeaderContext, getBoundingBox, setMapFilter } from '../../redux/reducers/mapReducer.js'
import * as form from './handleForm.js'

import './search.css'

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
        const output = form.parseSearch(e)

        // get KSI and range state from store
        const range = this.props.range || {}
        const ksiCheck = this.props.crashType || 'ksi'
        output.isKSI = ksiCheck === 'ksi' ? 'yes' : 'no'

        // zoom to address for address searches
        if(output.coords) {
            output.coords.then(result => {
                const center = result.features[0].center
                this.props.setMapCenter(center)
            })
        }

        const tileType = output.type[0]
        let sidebarName = tileType === 'c' ? `${output.name} County` : output.name

        // create data, filter and boundary objects
        const dataObj = { geoID: output.geoID, isKSI: output.isKSI }
        const boundaryObj = { type: output.type, name: output.name }
        const filterObj = {filterType: ksiCheck, tileType, id: output.geoID, range, boundary: true}
        
        console.log('filterObj is : ', filterObj)

        // // dispatch actions to: set sidebar header, fetch the data and create a bounding box for the selected area
        this.props.setSidebarHeaderContext(sidebarName)
        this.props.getData(dataObj)
        this.props.setMapBounding(boundaryObj)
        this.props.getBoundingBox(output.geoID)
        this.props.setMapFilter(filterObj)
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
                        <input name="address" type="text" placeholder="enter address" />
                    </fieldset>
                    )
                }
                <input type="submit" value="search" />
            </form>
        )
    }
}

const mapStateToProps = state => {
    return {
        crashType: state.crashType,
        range: state.range
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

export default connect(mapStateToProps, mapDispatchToProps)(Search);