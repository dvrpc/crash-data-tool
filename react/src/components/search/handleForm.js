import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { counties, munis, states } from './dropdowns.js'
import getDataFromKeyword from '../../redux/reducers/mapReducer.js'


////
// Functions to handle parsed form inputs
////
// runs the mapboxgl geocoder to turn address or boundary into coordinates
const geocode = jawn => {
    const accessToken = 'pk.eyJ1IjoibW1vbHRhIiwiYSI6ImNqZDBkMDZhYjJ6YzczNHJ4cno5eTcydnMifQ.RJNJ7s7hBfrJITOBZBdcOA'
    const geocoder = new MapboxGeocoder({accessToken})
    jawn += ' post geocoding'
    return jawn
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

    const output = { 
        coords: [], 
        boundary: {
            type: '',
            name: ''
        } 
    }

    const form = e.target
    const data = new FormData(form)
    
    // extract form data to finish das form
    for(var [key, input] of data.entries()) {
        switch(key) {
            case 'type':
                output.boundary.type = input
                break
            case 'boundary': 
                output.boundary.name = encodeURIComponent(input)
                output.coords = geocode(input)
                break
            // The API is not set up to handle states yet
            case 'state':
                output.boundary.name = encodeURIComponent(input)
                output.coords = geocode(input)
                break
            default:
                output.coords = geocode(input)
                output.boundary = false
        }
    }

    return output
}

export  { handleSelect, submitSearch }