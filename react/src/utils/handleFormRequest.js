// this series of functions takes in form data and outputs a response (which will eventually be put into the Redux store for Sidebar to consume and populate itself with)
import gql from 'graphql-tag'
import ApolloClient from 'apollo-boost'

const buildUri = '10.1.1.194:4000/graphql'
const localUri = 'http://localhost:4000/graphql'

const client = new ApolloClient({
    uri: localUri
})

// for each instance of MAX_SEVERI, build out nearly identical queries w/different MAX_SEVERI parameters
    // NOT using fragments here because all the different combination types - from the standard options to the advanced options
const buildQueryLogic = params => {
    let queries = '{';
    const crashSeverity = params.severity
    
    // eventually want this to be smart enough to populate the COUNTY, COLLISION, etc., based on what the params are
    crashSeverity.forEach(severity => {
        let query = `
            ${severity.alias}: crashes(MAX_SEVERI: "${severity.value}"){
                MAX_SEVERI,
                COUNTY,
                COLLISION {
                    ${[...params.collisions]}
                },
                VEHICLE_CO {
                    ${[...params.vehicles]}
                }
            },`

        queries += query
    })

    queries += '}'

    return queries
}

// use the constructed query strings to make a call
const buildCrashQuery = queries => {
    return client.query({
        query: gql(queries)
    // eventually the output here will hit a reducer so that Sidebar.js can consume result
    }).then(result => result)
}

export { buildQueryLogic, buildCrashQuery }