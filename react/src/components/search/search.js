import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getDataFromKeyword, setMapCenter } from '../../redux/reducers/mapReducer.js'
import * as form from './handleForm.js'

import './search.css'

class Search extends Component {
    constructor(props){
        super(props)
        this.state = {
            selectedSearch: false
        }
    }
    
    selectSearch = e => {
        const value = e.target.value
        const selectedSearch = form.handleSelect(value)

        this.setState({selectedSearch})
    }

    submitSearch = e => {
        const output = form.submitSearch(e)
        
        // pass coords to update the map
        const mapCenter = output.coords
        this.props.setMapCenter(mapCenter)

        // hit the api to get sidebar info (if applicable)
        if(output.boundary){
            const boundary = output.boundary
            this.props.getData(boundary)
        }
    }

    render() {
        const selectedSearch = this.state.selectedSearch

        return (
            <form id="search-form" onSubmit={ this.submitSearch }>
                <fieldset name="type" form="search-form">
                    <label htmlFor="select-search-type">Search By: </label>
                    <select name="type" id="select-search-type" onChange={ this.selectSearch }>
                        <option value="address">Address</option>
                        <option value="county">County</option>
                        <option value="municipality">Municipality</option>
                        <option value="state">State</option>
                    </select>
                </fieldset>
                {selectedSearch ? (
                    <fieldset name="boundary" form="search-form">
                        <select name="boundary" id="search-type">
                            { selectedSearch.map(e => <option key={e}>{e}</option>) }
                        </select>
                    </fieldset>
                    ) : (
                    <fieldset name="address" form="search-form">
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
        setMapCenter: coords => dispatch(setMapCenter(coords))
    }
}

export default connect(null, mapDispatchToProps)(Search);