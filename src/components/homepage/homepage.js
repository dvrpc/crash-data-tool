import React, { Component } from 'react';

import './homepage.css';


class Homepage extends Component {
    // @TODO: replace this, obviously
    clickJawn = e => {
        e.preventDefault()
        this.props.history.push('/crash-web-map')
    }

    render() {
    return (
        <div id="homepage">
            <h1>Temporary homepage for crash data tool</h1>

            <hr />
            {/*
                Future goals:
                    Container that has a bunch of 'tiles' that each link to different apps
                    the web viewer will be one of several. For now it's just a div
            */}
            <div id="temp-jawn" onClick={this.clickJawn}>
                click here to go to the crash data web viewer
            </div>
        </div>
    );
    }
}

export default Homepage;
