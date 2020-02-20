import React, { Component } from 'react';

import { modalContent } from './modalContent.js'
import './infoModal.css';

class Modal extends Component {
    showModal = () => this.modal.setAttribute('open', true)
    hideModal = () => this.modal.removeAttribute('open')

    handleTabs = e => {
        const target = e.target
        const selectedTab = target.id.split('-')[1]
        const tabsDiv = target.parentElement
        const contentDiv = tabsDiv.nextElementSibling
        const allTabs = tabsDiv.children
        const length = allTabs.length
        
        // reset all tabs to default
        for(var i=0; i<length;i++) {
          allTabs[i].classList.remove('crash-map-modal-active-tab')
        }
        
        // set active tab + pull in content
        target.classList.add('crash-map-modal-active-tab')
        while(contentDiv.firstChild) contentDiv.removeChild(contentDiv.firstChild)
        contentDiv.insertAdjacentHTML('afterbegin', modalContent[selectedTab])
      }

    render() {
        return (
            <div>
                <button id="crash-map-nav-info-btn" type="button" onClick={this.showModal}>?</button>
                <dialog id="crash-map-modal" ref={el => this.modal = el}>
                    <button type="button" className="crash-map-close-modal" id="crash-map-modal-x" onClick={this.hideModal}>X</button>
                    <h2>DVRPC Crash Data Viewer</h2>
                    <div id="crash-map-modal-tabs" onClick={this.handleTabs}>
                        <h3 id="crash-about-tab" className="crash-map-modal-active-tab">About</h3>
                        <h3 id="crash-how-tab">How To</h3>
                        <h3 id="crash-disclaimer-tab">Disclaimer</h3>
                    </div>
                    <div id="crash-map-modal-content">
                        <p>Words about the app. Hey, you know how I'm, like, always trying to save the planet? Here's my chance. Did he just throw my cat out of the window? My dad once told me, laugh and the world laughs with you, Cry, and I'll give you something to cry about you little! Is this my espresso machine? Wh-what is-h-how did you get my espresso machine?</p>
                        <p>Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists. God help us, we're in the hands of engineers. Yeah, but your scientists were so preoccupied with whether or not they could, they didn't stop to think if they should.</p>
                        <p>You know what? It is beets. I've crashed into a beet truck. Must go faster. Just my luck, no ice. We gotta burn the rain forest, dump toxic waste, pollute the air, and rip up the OZONE! 'Cause maybe if we screw up this planet enough, they won't want it anymore!</p>
                        <p><strong>Contact:</strong> Kevin Murphy <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a></p>
                    </div>
                </dialog>
            </div>
        )
    }
}

export default Modal