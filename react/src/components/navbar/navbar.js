import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import Search from '../search/search.js';
import Modal from '../infoModal/infoModal.js';
import './navbar.css';

class Navbar extends Component {
  render() {
    return (
        <nav id="navbar" className="no-print">
          <div id="navbar-start-content" className="no-print">
            <Link id="crash-map-nav-home" to="/">HOME</Link>
            <Modal />
          </div>
          <Search />
        </nav>
    );
  }
}

export default Navbar;
