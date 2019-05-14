import { counties, munis, states } from './dropdowns.js'

////
// Functions to handle parsed form inputs
////
// runs the mapboxgl geocoder to turn address or boundary into coordinates
// API reference: https://docs.mapbox.com/api/search/#mapboxplaces
const geocode = async query => {
    const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
    const api = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&autocomplete=true&bbox=-76.09405517578125,39.49211914385648,-74.32525634765625,40.614734298694216`
    
    // @TODO: add error handling
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
            return Object.keys(counties).sort((a, b) => a + b)
        case 'municipality':
            return Object.keys(munis).sort((a, b) => a + b)
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
        boundary: {
            type: '',
            name: ''
        } 
    }

    const form = e.target
    const data = new FormData(form)
    let query;
    
    // extract form data to finish das form
    for(var [key, input] of data.entries()) {
        switch(key) {
            case 'type':
                output.boundary.type = input
                break
            case 'boundary':
                query = encodeURIComponent(input)
                output.boundary.name = query

                // get the boundary ID for filtering
                const type = output.boundary.type
                output.boundary.id = type === 'county' ? counties[input] : munis[input]
                break
            // The API is not set up to handle states yet
            case 'state':
                query = encodeURIComponent(input)
                output.coords = geocode(query)
                output.boundary.name = query
                break
            default:
                query = encodeURIComponent(input)
                output.coords = geocode(query)
                output.boundary.name = false
        }
    }

    return output
}

export  { handleSelect, submitSearch }