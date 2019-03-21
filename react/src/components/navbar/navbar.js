import React, { Component } from 'react';

import './navbar.css';
class Navbar extends Component {
  constructor() {
    super()
    this.state = {
    }
  }

  render() {
    return (
        <nav id="navbar">
          <a id="crash-map-nav-home" href="https://www.youtube.com/watch?v=53yaDdg2gy8">HOME</a>
        </nav>
    );
  }
}

export default Navbar;
