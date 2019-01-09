import React, { Component } from 'react';
import { Switch } from "react-router";
import { BrowserRouter, Route } from "react-router-dom"
import ApolloClient from 'apollo-boost'
import gql from 'graphql-tag'
import { ApolloProvider } from 'react-apollo'

import './App.css';
import Homepage from './components/homepage/homepage.js'
import CrashMapContainer from './components/crashMapContainer/crashMapContainer.js'

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql"
})

// test query
client.query({
  query: gql `
    {
        killed: crashes(MAX_SEVERI: "Killed"){
        MAX_SEVERI
        VEHICLE_CO {
          MOTORCYCLE
        }
      },
      moderate: crashes(MAX_SEVERI: "Moderate injury"){
        MAX_SEVERI
        VEHICLE_CO {
          MOTORCYCLE
        }
      }
    }
  `
}).then(result => console.log('test query result ', result))

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <BrowserRouter basename={`${process.env.PUBLIC_URL}`}>
          <Switch>
            <Route exact path="/" component={Homepage} />
            <Route path="/crash-web-map" component = {CrashMapContainer} />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    );
  }
}

export default App;
