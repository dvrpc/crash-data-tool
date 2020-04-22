import React, { Component } from 'react';
import Footer from '../footer/footer.js';

import './homepage.css';

class Homepage extends Component {
    clickJawn = e => {
        e.preventDefault()
        this.props.history.push('/crash-web-map')
    }

    render() {
        return (
            <div id="homepage" className="no-print">
                <header>
                    <img id="header-logo" src="https://www.dvrpc.org/PhotosAndLogos/img/dvrpc_logo_white.png" alt="logo" />
                </header>

                <h1 id="homepage-header">DVRPC Crash Data Toolkit</h1>
                <div id="banner"></div>

                <main id="crash-toolkit-main">
                    <h2 className="homepage-h2">Select Product</h2>
                    <section id="crash-apps-container">
                        <figure className="crash-app crash-app-inactive">
                            <img src="https://previews.123rf.com/images/rondale/rondale1702/rondale170200144/72112575-crash-comic-text-bubble-vector-isolated-color-icon.jpg" alt="trendsw" className="crash-app-img" />
                            <figcaption>
                                Trends <br />
                                <small><strong>Coming Soon!</strong> God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs.</small>
                            </figcaption>
                        </figure>

                        <figure className="crash-app" onClick={this.clickJawn}>
                            <img src="https://thumbs.gfycat.com/PastEssentialCero-small.gif" alt="hot rod" className="crash-app-img" />
                            <figcaption>
                                Crash Map <br />
                                <small>God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs.</small>
                            </figcaption>
                        </figure>

                        <figure className="crash-app crash-app-inactive">
                            <img src="https://cdn3.vectorstock.com/i/1000x1000/95/77/crash-sound-effect-vector-6259577.jpg" alt="jawns" className="crash-app-img" />
                            <figcaption>
                                Trends 2: Trendier<br />
                                <small><strong>Coming Soon!</strong> God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs.</small>
                            </figcaption>
                        </figure>
                    </section>
                    
                    <h2 className="homepage-h2">Office of Safe Streets</h2>
                    <section id="safe-streets-container">
                        <p>Safe Streets matters to everyone, so DVRPC pursues an active, wide-ranging approach to improve it. Office of Safe Streets is incorporated in a great many of DVRPC's Work Program efforts, from safe routes to school, to use of technology for operations and incident management, to the Long-Range Plan and corridor studies. The broad Transportation Office of Safe Streets and Security program helps coordinate these efforts and also includes many specific tasks.</p>
                    </section>
                </main>

                <Footer />
            </div>
        );
    }
}

export default Homepage;
