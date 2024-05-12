import { counties, munis, states, philly } from './dropdowns.js'

////
// Functions to handle parsed form inputs
////
// runs the mapboxgl geocoder to turn address or boundary into coordinates
// API reference: https://docs.mapbox.com/api/search/#mapboxplaces
const geocode = async query => {
    const token = 'pk.eyJ1IjoibW1vbHRhIiwiYSI6ImNqZDBkMDZhYjJ6YzczNHJ4cno5eTcydnMifQ.RJNJ7s7hBfrJITOBZBdcOA'
    const api = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&autocomplete=true&bbox=-76.09405517578125,39.49211914385648,-74.32525634765625,40.614734298694216`
    
    try {
        const stream = await fetch(api)
        const result = await stream.json()
    
        return result
    } catch (error) {
        console.error(error)
        return false
    }
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
        case 'states':
            return states
        case 'philly':
            return Object.keys(philly).sort((a, b) => a + b)
        default:
            return false
    }
}

// parse form inputs and figure out what to do with them
const parseSearch = e => {
    e.preventDefault()

    const output = { 
        type: '',
        geoID: '',
        isKSI: ''
    }

    const form = e.target
    const data = new FormData(form)
    let query;
    
    // extract form data
    for(var [key, input] of data.entries()) {
        switch(key) {
            case 'type':
                output.type = input
                break
            case 'boundary':
                output.name = input

                switch(output.type){
                    case 'county':
                        output.geoID = counties[input]
                        break
                    case 'municipality':
                        output.geoID = munis[input]
                        break
                    case 'philly':
                        output.geoID = philly[input]
                        break
                    default:
                        output.geoID = states[input]
                }
                
                break
            default:
                query = encodeURIComponent(input)
                output.coords = geocode(query)
                output.name = input
                output.geoID = ''
        }
    }

    return output
}

export  { handleSelect, parseSearch }