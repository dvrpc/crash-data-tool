import React, { Component } from 'react';
import { Switch } from "react-router";
import { BrowserRouter, Route } from "react-router-dom"
import ApolloClient from 'apollo-boost'

import './App.css';
import Homepage from './components/homepage/homepage.js'
import CrashMapContainer from './components/crashMapContainer/crashMapContainer.js'

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql"
})

class App extends Component {
  render() {
    return (
      <BrowserRouter basename={`${process.env.PUBLIC_URL}`}>
        <Switch>
          <Route exact path="/" component={Homepage} />
          <Route path="/crash-web-map" component = {CrashMapContainer} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
