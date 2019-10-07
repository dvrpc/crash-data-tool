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
            <header>
                <img id="header-logo" src="https://www.dvrpc.org/PhotosAndLogos/img/dvrpc_logo_white.png" alt="logo" />
            </header>

            {/* banner */}
            <h1 id="homepage-h1">DVRPC Crash Data Toolkit</h1>
            <div id="banner">
            </div>

            <section id="crash-apps-container">
                <figure className="crash-app" onClick={this.clickJawn}>
                    <img src="https://cdn3.iconfinder.com/data/icons/data-science-set-01-1/65/6-512.png" alt="trendsw" className="crash-app-img" />
                    <figcaption>Trends</figcaption>
                </figure>

                <figure className="crash-app" onClick={this.clickJawn}>
                    <img src="https://thumbs.gfycat.com/PastEssentialCero-small.gif" alt="hot rod" className="crash-app-img" />
                    <figcaption>Crash Map</figcaption>
                </figure>

                <figure className="crash-app" onClick={this.clickJawn}>
                    <img src="https://cdn3.iconfinder.com/data/icons/data-science-set-01-1/65/6-512.png" alt="jawns" className="crash-app-img" />
                    <figcaption>Jawns</figcaption>
                </figure>
            </section>

            <footer>
                <p>DVRPC Footer</p>
            </footer>
        </div>
    );
    }
}

export default Homepage;
