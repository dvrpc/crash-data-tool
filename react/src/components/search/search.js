import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getDataFromKeyword, setMapCenter, setMapBounding } from '../../redux/reducers/mapReducer.js'
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

        // push the new map center
        output.coords.then(result => {
            const center = result.features[0].center
            
            this.props.setMapCenter(center)
        })

        // hit the api to get sidebar info (if applicable)
        if(output.boundary.name){
            const boundary = output.boundary

            this.props.getData(boundary)
            this.props.setMapBounding(boundary)
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
        setMapCenter: coords => dispatch(setMapCenter(coords)),
        setMapBounding: boundingObj => dispatch(setMapBounding(boundingObj))
    }
}

export default connect(null, mapDispatchToProps)(Search);