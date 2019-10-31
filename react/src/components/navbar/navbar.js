import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import Search from '../search/search.js'
import './navbar.css';

const modalContent = {
  about: `
    <p>Words about the app. Hey, you know how I'm, like, always trying to save the planet? Here's my chance. Did he just throw my cat out of the window? My dad once told me, laugh and the world laughs with you, Cry, and I'll give you something to cry about you little bastard! Is this my espresso machine? Wh-what is-h-how did you get my espresso machine?</p>
    <p>Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists. God help us, we're in the hands of engineers. Yeah, but your scientists were so preoccupied with whether or not they could, they didn't stop to think if they should.</p>
    <p>You know what? It is beets. I've crashed into a beet truck. Must go faster. Just my luck, no ice. We gotta burn the rain forest, dump toxic waste, pollute the air, and rip up the OZONE! 'Cause maybe if we screw up this planet enough, they won't want it anymore!</p>
    <p><strong>Contact:</strong> Kevin Murphy <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a></p>
  `,
  how: `
    <ul>
      <li>Use the map
        <p>Clicking municipalities and whatnot</p>
        <p>Drawing polygons and whatnot</p>
        <p>Toggling crash types and whatnot</p>
      </li>
      <li>Use the nav search
        <p>click the jawns and press search its not hard</p>
      </li>
      <li>Interact with the sidebar
        <p>read the things and toggle the range if you're into that kind of thing</p>
      </li>
    </ul>
  `,
  disclaimer: `
    <p>This web page is a public resource of general information. The Delaware Valley Regional Planning Commission (DVRPC) makes no warranty, representation, or guarantee as to the content, sequence, accuracy, timeliness, or completeness of any of the spatial data or database information provided herein. DVRPC and partner state, local, and other agencies shall assume no liability for errors, omissions, or inaccuracies in the information provided regardless of how caused; or any decision made or action taken or not taken by any person relying on any information or data furnished within.</p>
  `
}

class Navbar extends Component {
  showModal = () => this.modal.setAttribute('open', true)
  hideModal = () => this.modal.removeAttribute('open')

  handleTabs = e => {
    const target = e.target
    const tabsDiv = target.parentElement
    const contentDiv = tabsDiv.nextElementSibling
    const selectedTab = target.id.split('-')[1]
    const allTabs = tabsDiv.children
    const length = allTabs.length
  
    for(var i=0; i<length;i++) {
      allTabs[i].classList.remove('crash-map-modal-active-tab')
    }

    target.classList.add('crash-map-modal-active-tab')
    contentDiv.innerHTML = modalContent[selectedTab]
  }

  render() {
    return (
        <nav id="navbar">
          <div>
            <Link id="crash-map-nav-home" to="/">HOME</Link>
            <dialog id="crash-map-modal" ref={el => this.modal = el}>
              <button type="button" className="crash-map-close-modal" id="crash-map-modal-x" onClick={this.hideModal}>X</button>
              <h2>DVRPC Crash Data Viewer</h2>
              <div id="crash-map-modal-tabs" onClick={this.handleTabs}>
                <h3 id="crash-about-tab" className="crash-map-modal-active-tab">About</h3>
                <h3 id="crash-how-tab">How To</h3>
                <h3 id="crash-disclaimer-tab">Disclaimer</h3>
              </div>
              <div id="crash-map-modal-content">
                <p>Words about the app. Hey, you know how I'm, like, always trying to save the planet? Here's my chance. Did he just throw my cat out of the window? My dad once told me, laugh and the world laughs with you, Cry, and I'll give you something to cry about you little bastard! Is this my espresso machine? Wh-what is-h-how did you get my espresso machine?</p>
                <p>Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists. God help us, we're in the hands of engineers. Yeah, but your scientists were so preoccupied with whether or not they could, they didn't stop to think if they should.</p>
                <p>You know what? It is beets. I've crashed into a beet truck. Must go faster. Just my luck, no ice. We gotta burn the rain forest, dump toxic waste, pollute the air, and rip up the OZONE! 'Cause maybe if we screw up this planet enough, they won't want it anymore!</p>
                <p><strong>Contact:</strong> Kevin Murphy <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a></p>
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
