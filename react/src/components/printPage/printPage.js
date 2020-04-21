import React, { Component } from 'react';
import PrintTemplate from 'react-print';

class PrintPage extends Component {
    constructor() {
        super()
    }

    // pull info from the store so as not to add state to CrashMapcontainer
    componentDidMount() {

    }
    render() {
        return(
            <PrintTemplate>
                <h1>Print Template</h1>
            </PrintTemplate>
        )
    }
}

// @TODO: add dispatchToProps for context + API response 

export default PrintPage