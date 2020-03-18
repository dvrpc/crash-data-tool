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
                        <p>In transportation planning, crash data is a vital resource for identifying crash trends and needed safety improvements. DVRPC is consistent with state and local partners by employing a Vision Zero approach to crash data analysis: no loss of life in our region's roadways is acceptable. Roadway owners and policymakers should focus on preventing crashes that result in fatalities or serious injuries - the most severe crashes on the road.</p>
                        <span>Injury severity from crashes is divided into seven possible categories:</span>
                        <ol>
                            <li><strong>Fatality</strong>: Fatalities stemming from crashes may occur up to 30 days following the crash for the injury to be coded as fatal.</li>
                            <li><strong>Suspected Serious Injury</strong>: The responding police officer suspects that the person sustained a serious, often incapacitating, injury.</li>
                            <li><strong>Suspected Minor Injury</strong>: The responding police officer suspects that the person sustained an injury less sever than a serious injury, and the injury is "evident".</li>
                            <li><strong>Possible Injury</strong>: The responding police officer suspects that the person sustained an injury of low severity, sometimes a "complaint of pain," and the injury is not readily evident.</li>
                            <li><strong>Not Injured</strong>: The responding police officer does not suspect that the person was injuried.
                            <ul>
                                <li>In <strong>Pennsylvania</strong>, if no one was injured than at least one vehicle must require a tow from the scene of the crash for that crash to be considered "reportable."</li>
                                <li> In <strong>New Jersey</strong> a crash is "reportable" if any one person involved is injured, or if there is damage to property of $500 or more.</li>
                            </ul>
                            </li>
                            <li><strong>Unknown Injury</strong>: An injury is suspected but the severity of the injury is unknown.</li>
                            <li><strong>Unknown if Injured</strong>: Data is unavailable regarding whether the person was injured.</li>
                        </ol>
                        <hr id="crash-map-modal-hr"/>
                        <p><strong>Contact:</strong> Kevin Murphy <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a></p>
                    </div>
                </dialog>
            </div>
        )
    }
}

export default Modal