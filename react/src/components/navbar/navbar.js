import React, { Component } from 'react';
import QueryModal from '../queryModal/queryModal.js'

import './navbar.css';
class Navbar extends Component {
  constructor() {
    super()
    this.state = {
      viewModal: false
    }
  }

  revealModal = () => this.setState({viewModal: !this.state.viewModal})

  render() {
    return (
        <nav id="navbar">
          <a id="crash-map-nav-home" href="https://www.youtube.com/watch?v=53yaDdg2gy8">HOME</a>
          <button id="crash-map-nav-button" type="submit" onSubmit={this.revealModal} onClick={this.revealModal}>new query</button>
          {(this.state.viewModal ? <QueryModal show={this.state.viewModal}/> : null)}
        </nav>
    );
  }
}

export default Navbar;
