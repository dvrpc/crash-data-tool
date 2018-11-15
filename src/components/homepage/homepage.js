import React, { Component } from 'react';

import './homepage.css';

// homepage background gif 
// https://thumbs.gfycat.com/PastEssentialCero-small.gif

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
            {/*
                Future goals:
                Container that has a bunch of 'tiles' that each link to different apps
                the web viewer will be one of several. For now it's just a div
            */}
            <section id="crash-apps-container">
                <div class="crash-app">
                    <img src="https://cdn0.iconfinder.com/data/icons/car-crash/500/hit-2-512.png" alt="hot rod" class="crash-app-img" />
                    <p class="crash-app-p">
                        placeholder
                    </p>
                </div>

                <div class="crash-app" onClick={this.clickJawn}>
                    <img src="https://thumbs.gfycat.com/PastEssentialCero-small.gif" alt="hot rod" class="crash-app-img" />
                    <p class="crash-app-p">
                        click here to go to the crash data web viewer
                    </p>
                </div>

                <div class="crash-app">
                    <img src="https://cdn0.iconfinder.com/data/icons/car-crash/500/hit-2-512.png" alt="hot rod" class="crash-app-img" />
                    <p class="crash-app-p">
                        placeholder
                    </p>
                </div>
            </section>
        </div>
    );
    }
}

export default Homepage;
