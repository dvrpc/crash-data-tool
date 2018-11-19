import React, { Component } from 'react';
import queryModal from '../queryModal/queryModal.js'

import './navbar.css';

class Navbar extends Component {
  render() {
    return (
        <nav id="navbar">
          <a id="crash-map-nav-home" href="https://www.youtube.com/watch?v=53yaDdg2gy8">HOME</a>
          <button id="crash-map-nav-button" type="submit" onSubmit={queryModal}>new query</button>
        </nav>
    );
  }
}

export default Navbar;
