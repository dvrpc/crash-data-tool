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
            <h1 id="homepage-header">DVRPC Crash Data Toolkit</h1>

            <section id="crash-apps-container">
                <div className="crash-app" onClick={this.clickJawn}>
                    <img src="https://thumbs.gfycat.com/PastEssentialCero-small.gif" alt="hot rod" className="crash-app-img" />
                    <p className="crash-app-p">
                        click here for the crash data web viewer
                    </p>
                </div>
            </section>

            <footer>
                <p>DVRPC Footer</p>
            </footer>
        </div>
    );
    }
}

export default Homepage;
