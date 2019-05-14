import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getDataFromKeyword, setMapCenter, setMapBounding, setSidebarHeaderContext, getBoundingBox } from '../../redux/reducers/mapReducer.js'
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

        // push the new map center when applicated (address search only)
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
        setMapBounding: boundingObj => dispatch(setMapBounding(boundingObj)),
        setSidebarHeaderContext: area => dispatch(setSidebarHeaderContext(area)),
        getBoundingBox: id => dispatch(getBoundingBox(id))
    }
}

export default connect(null, mapDispatchToProps)(Search);