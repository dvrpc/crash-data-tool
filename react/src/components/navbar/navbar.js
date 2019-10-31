import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import Search from '../search/search.js'
import './navbar.css';

class Navbar extends Component {
  // strange behavior here - dialog.show() is supposed to be native behavior to reveal dialogs but its saying that's not a function
  // using setAttribute('open', true) will show it, but it overrides the close functionality and makes it hard to close (https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)
  // strange behavior part two: setAttribute('open', false) isn't doing anything and dialog.close() doesn't work b/c setAttribute from showModal overrides it. but .show() doesn't work either so wtf
  // the current set up is somewhat of a hack but it works so...

  showModal = () => this.modal.setAttribute('open', true)
  hideModal = () => this.modal.removeAttribute('open')

  render() {
    return (
        <nav id="navbar">
          <div>
            <Link id="crash-map-nav-home" to="/">HOME</Link>
            <dialog id="crash-map-modal" ref={el => this.modal = el}>
              <button type="button" className="crash-map-close-modal" id="crash-map-modal-x" onClick={this.hideModal}>X</button>
              <h2>DVRPC Crash Data Viewer</h2>
              <div id="crash-map-modal-tabs">
                <h3 id="crash-map-modal-active-tab">About</h3>
                <h3>How To</h3>
                <h3>Contact</h3>
                <h3>Disclaimer</h3>
              </div>
              <div id="crash-map-modal-content">
                <ul>
                  <li>How to filter with the navbar</li>
                  <li>
                    How to interact with the map
                    <ul>
                      <li>Clicking on municipalities</li>
                      <li>How to draw polygons</li>
                    </ul>
                  </li>
                  <li>How to interact with the sidebar</li>
                  <li>
                      Alternatively, we could have tabs
                      <ul>
                        <li>About</li>
                        <li>How To</li>
                        <li>Contact</li>
                        <li>Disclaimer</li>
                      </ul>

                  </li>
                </ul>
              </div>
            </dialog>
            <button id="crash-map-nav-info-btn" type="button" onClick={this.showModal}>i</button>
          </div>
          <Search />
        </nav>
    );
  }
}

export default Navbar;
