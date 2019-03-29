import { counties, munis, states } from './dropdowns.js'

// based off of the selected value, create the next dropdown or search bar
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

// GETS response data from database and tells the map to update
const submitSearch = async e => {
    e.preventDefault()
    
    // Full endpoint: `https://a.michaelruane.com/api/crash-data/v1/sidebarInfo?type=${type}&value=${value}`
    let api = `https://a.michaelruane.com/api/crash-data/v1/sidebarInfo?`
    let type, value;

    const form = e.target
    const data = new FormData(form)
    
    // extract form data to finish das form
    for(var [key, input] of data.entries()) {
        switch(key) {
            case 'type':
                type = input
                break
            case 'boundary': 
                value = encodeURIComponent(input)
                break
            case 'state':
                value = encodeURIComponent(input)
                break
            default:
                console.log('default address case ', input)
                // address case won't hit the API from here. It'll geocode a valid address and then pass that info to map.flyTo()
                // after flyTo() is done, get the boundingBox from the new map extent and pass that to the API
                    // it can either be a separate endpoint or add logic to handle `type=address&value=[[sw co-ordinate],[ne co-ordinates]]`
        }
    }

    api += `type=${type}&value=${value}`

    // @TODO: add options to fetch
    const stream = await fetch(api)
    const response = await stream.json()
    console.log('response is ', response)

    //
    // Map update will have a location to zoomTo, and a boundary object (when applicable) to constrain the map results
    // 
        // Find a way to extract location geometry from the county/municipality strings. Address will take care of itself via geocoding. ZoomTo location
        // Boundary object (true for muni and county, null for address) adds filters to the following mapbox layers:
            // circles: filter out all that != the passed county or muni name
            // muniOutline: IF muni, increase line-width and change line-color of the passed muni name
            // countyOutline: IF county, increase line-width and change line-color of the passed county name
            // add a 'Remove Boundary' overlay to the map that changes boundary to null
            // Null boundary object shows all results for the map extent. 

}

export  { handleSelect, submitSearch }