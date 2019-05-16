import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import Search from '../search/search.js'
import './navbar.css';

class Navbar extends Component {
  render() {
    return (
        <nav id="navbar">
          <Link id="crash-map-nav-home" to="/">HOME</Link>
          <Search />
        </nav>
    );
  }
}

export default Navbar;
