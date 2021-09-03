import React, { Component } from 'react';

import { modalContent } from './modalContent.js'
import './infoModal.css';

class Modal extends Component {
    componentDidMount() {
        document.onkeydown = e => this.keyDownModal(e)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyDownModal, false)
    }

    showModal = () => {
        this.modal.style.display = 'flex'
        this.modal.style.justifyContent = 'center'
        this.modal.style.alignItems = 'center'
        this.modal.setAttribute('aria-hidden', 'false')
    }

    hideModal = () => {
        this.modal.style.display = 'none'
        this.modal.setAttribute('aria-hidden', 'true')
    }

    clickModal = e => {
        if (e.target === this.modal) this.hideModal()
    }

    keyDownModal = e => {
        if( e.code === 'Escape' && this.modal.style.display === 'flex') this.hideModal()
    }

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
            <div className="no-print">
                <button id="crash-map-nav-info-btn" type="button" onClick={this.showModal}>about</button>
                
                <div role="dialog" id="crash-map-modal" aria-modal="true" aria-labelledby="crash-map-nav-info-btn" ref={el => this.modal = el} onClick={this.clickModal} onKeyDown={this.keyDownModal}>
                    
                    <div id="modal-content">
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
                            
                            <ol className="crash-map-modal-category-list">
                                <li><details><summary><strong>Fatality</strong></summary> Fatalities stemming from crashes may occur up to 30 days following the crash for the injury to be coded as fatal.</details></li>
                                <li><details><summary><strong>Suspected Serious Injury</strong></summary> The responding police officer suspects that the person sustained a serious, often incapacitating, injury.</details></li>
                                <li><details><summary><strong>Suspected Minor Injury</strong></summary> The responding police officer suspects that the person sustained an injury less sever than a serious injury, and the injury is "evident".</details></li>
                                <li><details><summary><strong>Possible Injury</strong></summary> The responding police officer suspects that the person sustained an injury of low severity, sometimes a "complaint of pain," and the injury is not readily evident.</details></li>
                                <li>
                                    <details>
                                        <summary><strong>Not Injured</strong></summary> The responding police officer does not suspect that the person was injuried.
                                        <ul>
                                            <li>In <strong>Pennsylvania</strong>, if no one was injured than at least one vehicle must require a tow from the scene of the crash for that crash to be considered "reportable."</li>
                                            <li> In <strong>New Jersey</strong> a crash is "reportable" if any one person involved is injured, or if there is damage to property of $500 or more.</li>
                                        </ul>
                                    </details>
                                </li>
                                <li><details><summary><strong>Unknown Injury</strong></summary> An injury is suspected but the severity of the injury is unknown.</details></li>
                                <li><details><summary><strong>Unknown if Injured</strong></summary> Data is unavailable regarding whether the person was injured.</details></li>
                            </ol>
                            
                            <p>Following FHWA guidance, in 2016 most counties in Pennsylvania (except Philadelphia) adopted the term "Suspected Serious Injury" in place of "Major Injury," "Suspected Minor Injury" in place of "Moderate Injury," and "Possible Injury" in place of "Minor Injury”. Philadelphia and DVRPC’s New Jersey counties adopted these changes in 2019. Although these new terms did not result in a significant change in the definition of these injury types, it did redistribute the crashes within injury categories resulting in an increase in crashes labeled "Suspected Serious Injury" and corresponding decreases in injuries labeled as lesser severity. More information on FHWA’s guidance can be found <a href="https://safety.fhwa.dot.gov/hsip/spm/sir_planning_tool.cfm" target="_blank" rel="noopener noreferrer">here</a> and <a href="https://crashstats.nhtsa.dot.gov/Api/Public/ViewPublication/811631" target="_blank" rel="noopener noreferrer">here</a> (see P.5 Injury Status on page 34).</p>
                            <p>Raw crash data tables for this tool were downloaded from the <a href="https://pennshare.maps.arcgis.com/apps/webappviewer/index.html?id=8fdbf046e36e41649bbfd9d7dd7c7e7e" target="_blank" rel="noopener noreferrer">PennDOT Crash Download Map</a> and the <a href="https://www.state.nj.us/transportation/refdata/accident/rawdata01-current.shtm" target="_blank" rel="noopener noreferrer">NJDOT Crash Tables</a> webpage, for Pennsylvania and New Jersey data, respectively. The DVRPC Crash Data Viewer is updated annually when all crash data is available for the region; more recent crash data may be available for a particular state at the linked DOT websites.</p>
                            
                            <hr id="crash-map-modal-hr"/>
                            
                            <p><strong>Contact:</strong> Kevin Murphy <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a></p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Modal