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

            <h1 id="homepage-h1">DVRPC Crash Data Toolkit</h1>
            <div id="banner"></div>

            <section id="crash-apps-container">
                <figure className="crash-app" onClick={this.clickJawn}>
                    <img src="https://previews.123rf.com/images/rondale/rondale1702/rondale170200144/72112575-crash-comic-text-bubble-vector-isolated-color-icon.jpg" alt="trendsw" className="crash-app-img" />
                    <figcaption>
                        Trends <br />
                        <small>God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs.</small>
                    </figcaption>
                </figure>

                <figure className="crash-app" onClick={this.clickJawn}>
                    <img src="https://thumbs.gfycat.com/PastEssentialCero-small.gif" alt="hot rod" className="crash-app-img" />
                    <figcaption>
                        Crash Map <br />
                        <small>God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs.</small>
                    </figcaption>
                </figure>

                <figure className="crash-app" onClick={this.clickJawn}>
                    <img src="https://cdn3.vectorstock.com/i/1000x1000/95/77/crash-sound-effect-vector-6259577.jpg" alt="jawns" className="crash-app-img" />
                    <figcaption>
                        The 3rd Tool<br />
                        <small>God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs.</small>
                    </figcaption>
                </figure>
            </section>

            <footer>
                <div id="footer-words">
                    <img src="./img/footer/footer-logo.png" alt="dvrpc footer logo" id="footer-logo"/>
                    <address>
                        190 N. Independence Mall West, 8th Floor,<br />
                        Philadelphia, PA 19106-1520<br />
                        215.592.1800<br />
                        &copy; Delaware Valley Regional Planning Commission 
                    </address>
                </div>
            </footer>
        </div>
    );
    }
}

export default Homepage;
