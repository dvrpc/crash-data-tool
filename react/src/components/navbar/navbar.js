import React, { Component } from 'react';

import Search from '../search/search.js'
import './navbar.css';

class Navbar extends Component {
  render() {
    return (
        <nav id="navbar">
          <a id="crash-map-nav-home" href="https://www.youtube.com/watch?v=53yaDdg2gy8">HOME</a>
          <Search />
        </nav>
    );
  }
}

export default Navbar;
