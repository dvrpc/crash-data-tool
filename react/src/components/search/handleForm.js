import { counties, munis, states } from './dropdowns.js'


////
// Functions to handle parsed form inputs
////
// runs the mapboxgl geocoder to turn address or boundary into coordinates
// API reference: https://docs.mapbox.com/api/search/#mapboxplaces
const geocode = async query => {
    const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
    const api = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&autocomplete=true&bbox=-76.09405517578125,39.49211914385648,-74.32525634765625,40.614734298694216`
    
    const stream = await fetch(api)
    const result = await stream.json()

    return result
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
                // new plan: instead of a <Geocoder> component, hit the public geocoder API and extract the co-ordinates from there. 
                // Figure out typeahead after that...
                const query = encodeURIComponent(input)
                output.coords = geocode(query)
                output.boundary.name = false
        }
    }

    return output
}

export  { handleSelect, submitSearch }