import React, { Component } from 'react'

import './search.css'
import * as form from './handleForm.js'

class Search extends Component {
    constructor(){
        super()
        this.state = {
            selectedSearch: false
        }
    }
    
    selectSearch = e => {
        const value = e.target.value
        const selectedSearch = form.handleSelect(value)

        this.setState({selectedSearch})
    }

    render() {
        const selectedSearch = this.state.selectedSearch

        return (
            <form id="search-form" onSubmit={ form.submitSearch }>
                <label htmlFor="select-search-type">Search By: </label>
                <select id="select-search-type" onChange={ this.selectSearch }>
                    <option value="address">Address</option>
                    <option value="county">County</option>
                    <option value="municipality">Municipality</option>
                    <option value="state">State</option>
                </select>
                {selectedSearch ? (
                    <select id="search-type">
                        { selectedSearch.map(e => <option key={e}>{e}</option>) }
                    </select>
                ) : <input type="text" />
                }
                <input type="submit" value="search" />
            </form>
        )
    }
}

export default Search;