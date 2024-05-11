import React, { Component } from 'react'
import { connect } from 'react-redux'

// @UPDATE: import urlRoute
import { getDataFromKeyword, setMapCenter, setMapBounding, setSidebarHeaderContext, getBoundingBox, urlRoute } from '../../redux/reducers/mapReducer.js'
import * as form from './handleForm.js'

import './search.css'

class Search extends Component {
    constructor(props){
        super(props)

        // @UPDATE: put urlRoute on state
        this.state = {
            selectedSearch: ['Bucks','Chester','Delaware','Montgomery','Philadelphia','Gloucester','Camden','Burlington','Mercer'],
            route: urlRoute
        }
    }
    
    selectSearch = e => {
        const value = e.target.value
        const selectedSearch = form.handleSelect(value)

        this.setState({selectedSearch})
    }

    // @UPDATE: update URL route here 
        // replaceState + update searchParams obj state
    submitSearch = e => {
        const output = form.parseSearch(e)

        // zoom to area for address searches & exit
        if(output.coords) {
            output.coords.then(result => {
                const center = result.features[0].center
                this.props.setMapCenter(center)
            })
            return
        }

        // get KSI and range state from store
        const range = this.props.range || {}
        const ksiCheck = this.props.crashType || 'KSI'
        output.isKSI = ksiCheck === 'KSI' ? 'yes' : 'no'

        // handle PPA being munis but not munis
        const tileType = output.type[0] === 'p' ? 'm' : output.type[0]
        let sidebarName;
        
        if(tileType === 'c') sidebarName = `${output.name} County`
        else sidebarName = output.name

        // create data, filter and boundary objects
        const dataObj = { geoID: output.geoID, isKSI: output.isKSI }
        const filterObj = {filterType: ksiCheck, tileType, id: output.geoID, range, boundary: true}
        const boundaryObj = { type: output.type, id: output.geoID, filter: filterObj }
        
        // dispatch actions to: set sidebar header, fetch the data and create a bounding box for the selected area
        this.props.setSidebarHeaderContext(sidebarName)
        this.props.getData(dataObj)
        this.props.setMapBounding(boundaryObj)
        this.props.getBoundingBox(output.geoID)

        // update URL
        const geoParam = `${output.geoID},${output.type},${encodeURI(output.name)}`
        
        this.state.route.searchParams.set('geom', geoParam)
        this.state.route.searchParams.set('filter', ksiCheck)
        
        window.history.replaceState(null, null, `?geom=${geoParam}&filter=${ksiCheck}`)
    }

    render() {
        const selectedSearch = this.state.selectedSearch

        return (
            <form id="search-form" className="no-print" onSubmit={ this.submitSearch }>
                <fieldset className="search-form-fieldset" name="type" form="search-form">
                    <label id="search-by-label">
                        search by: 
                        <select name="type" id="select-search-type" className="hover-btn search-form-select" onChange={ this.selectSearch }>
                            <option value="county">County</option>
                            <option value="municipality">Municipality</option>
                            <option value="philly">Philadelphia Planning Areas</option>
                            <option value="address">Address</option>
                        </select>
                    </label>
                </fieldset>
                {selectedSearch ? (
                    <fieldset className="search-form-fieldset" name="boundary" form="search-form">
                        <label>
                            <select name="boundary" id="search-type" className="hover-btn search-form-select">
                                { selectedSearch.map(e => <option key={e}>{e}</option>) }
                            </select>
                        </label>
                    </fieldset>
                    ) : (
                    <fieldset className="search-form-fieldset" name="address" form="search-form">
                        <input name="address" type="text" placeholder="enter address" id="search-form-address" />
                    </fieldset>
                    )
                }
                <input type="submit" className="hover-btn search-form-submit" value="go" />
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
        getBoundingBox: id => dispatch(getBoundingBox(id))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);