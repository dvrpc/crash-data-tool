import React, { Component } from 'react';
import QueryModal from '../queryModal/queryModal.js'

import './navbar.css';
class Navbar extends Component {
  constructor() {
    super()
    this.state = {
      renderModal: false
    }
  }

  revealModal = () => this.setState({renderModal: !this.state.renderModal})

  render() {
    return (
        <nav id="navbar">
          <a id="crash-map-nav-home" href="https://www.youtube.com/watch?v=53yaDdg2gy8">HOME</a>
          <button id="crash-map-nav-button" type="submit" onSubmit={this.revealModal} onClick={this.revealModal}>new query</button>
          {(this.state.renderModal ? <QueryModal show={this.state.renderModal}/> : null)}
        </nav>
    );
  }
}

export default Navbar;
