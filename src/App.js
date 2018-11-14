import React, { Component } from 'react';
import { Switch } from "react-router";
import { BrowserRouter, Route } from "react-router-dom"

import './App.css';
import Homepage from './components/homepage/homepage.js'
import CrashMapContainer from './components/crashMapContainer/crashMapContainer.js'

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Homepage} />
          <Route path="/crash-web-map" component = {CrashMapContainer} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
