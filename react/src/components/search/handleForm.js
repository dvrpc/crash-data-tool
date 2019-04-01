import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { counties, munis, states } from './dropdowns.js'


////
// Functions to handle parsed form inputs
////
const options = {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
}

const passSearchToAPI = async boundaryObj => {

    // destructure boundaryObj to get the type and boundary values
    const {type, boundary} = boundaryObj
    const api = `https://a.michaelruane.com/api/crash-data/v1/sidebarInfo?type=${type}&value=${boundary}`
    const stream = await fetch(api, options)

    // error handling - pass the failure message + the boundary object to give context to the displayed error response
    if(!stream.ok) return { fail: stream.statusText, boundaryObj }

    const response = await stream.json()
    
    console.log('response is ', response)

    // @TODO: put response in the Context tree so sidebar.js can consume it
}

// runs the mapboxgl geocoder to turn address or boundary into coordinates
const geocode = jawn => {
    const accessToken = 'pk.eyJ1IjoibW1vbHRhIiwiYSI6ImNqZDBkMDZhYjJ6YzczNHJ4cno5eTcydnMifQ.RJNJ7s7hBfrJITOBZBdcOA'
    const geocoder = new MapboxGeocoder({accessToken})
    console.log('geocoding ', jawn)
    return jawn
}

// passes a geocoded jawn and (optionally) a boundary object to map.js
const updateMap = (coords, boundaryObj) => {
    console.log('hit update map ')

    // geocode coordinates if necessary
    if(!coords) coords = geocode(boundaryObj.boundary)

    // put this jawn in the Context tree so that map.js can read from it
    const output = {
        coords,
        boundaryObj
    }
}


////
// Functions to parse form inputs
////
const handleSelect = value => {
    switch(value){
        case 'county':
            return counties
        case 'municipality':
            return munis
        case 'state':
            return states
        default:
            return false
    }
}

// parse form inputs and figure out what to do with them
const submitSearch = e => {
    e.preventDefault()
    let type, boundary, coords;
    let apiCall = true

    const form = e.target
    const data = new FormData(form)
    
    // extract form data to finish das form
    for(var [key, input] of data.entries()) {
        switch(key) {
            case 'type':
                type = input
                break
            case 'boundary': 
                boundary = encodeURIComponent(input)
                break
            // The API is not set up to handle states yet
            case 'state':
                boundary = encodeURIComponent(input)
                break
            default:
                apiCall = false
                coords = geocode(input)
        }
    }

    // get data from db and then geocode the boundary so that the map can update and do all the necessary filtering
    if(apiCall) {
        const boundaryObj = { type, boundary }
        
        passSearchToAPI(boundaryObj)
        updateMap(false, boundaryObj)

    // update the map let it handle hitting the API (map.flyTo() ==> map.LngLatBounds() ==> fetch(`endpoint-that-handles-geometry-envelopes`))
    }else{
        updateMap(coords, false)
    }
}

export  { handleSelect, submitSearch }