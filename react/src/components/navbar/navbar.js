import React, { Component } from 'react';

import logo from '../footer/img/footer-logo.png'

import Search from '../search/search.js';
import Modal from '../infoModal/infoModal.js';
import './navbar.css';

class Navbar extends Component {
  render() {
    return (
        <nav id="navbar" className="no-print">
          <div id="navbar-start-content" className="no-print">
            <a href="https://www.dvrpc.org" rel="noopener noreferrer" target="_blank"><img src={logo} alt="DVRPC logo" id="crash-nav-logo"/></a>
            <span className="nav-vr"></span>
            <Modal />
          </div>
          <Search />
        </nav>
    );
  }
}

export default Navbar;
