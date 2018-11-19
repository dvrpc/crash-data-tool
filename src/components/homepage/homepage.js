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
            <h1 id="homepage-header">Temporary homepage for crash data tool</h1>

            <hr />

            <section id="crash-apps-container">
                <div className="crash-app">
                    <img src="https://cdn0.iconfinder.com/data/icons/car-crash/500/hit-2-512.png" alt="hot rod" className="crash-app-img" />
                    <p className="crash-app-p">
                        placeholder
                    </p>
                </div>

                <div className="crash-app" onClick={this.clickJawn}>
                    <img src="https://thumbs.gfycat.com/PastEssentialCero-small.gif" alt="hot rod" className="crash-app-img" />
                    <p className="crash-app-p">
                        click here to go to the crash data web viewer
                    </p>
                </div>

                <div className="crash-app">
                    <img src="https://cdn0.iconfinder.com/data/icons/car-crash/500/hit-2-512.png" alt="hot rod" className="crash-app-img" />
                    <p className="crash-app-p">
                        placeholder
                    </p>
                </div>
            </section>
        </div>
    );
    }
}

export default Homepage;
