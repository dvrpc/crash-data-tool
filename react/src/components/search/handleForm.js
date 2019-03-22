const munis = [
    'ABINGTON','ASTON','Aldan','Ambler','Atglen','Audubon','Audubon Park','Avondale','BASS RIVER','BEDMINSTER'
]

const counties = [
'Atlantic','Berks','Bucks','Burlington','Camden','Cape May','Cecil','Chester','Cumberland','Delaware','Gloucester','Harford','Hunterdon','Kent','Lancaster','Lehigh','Mercer','Middlesex','Monmouth','Montgomery','New Castle','Northampton','Ocean','Philadelphia','Salem','Somerset','Warren','York'
]
const states = [
    'Pennsylvania','New Jersey'
]

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
    console.log('form submitted')
    
    //
    // Pass form data to a GET for db info. URL parameters for the GET request should look something like:
    //
    // `&type=${type}&value=${value}` where:
        // type is either county, municipality or address
        // value is either county name, municipality geoid or geometry envelope
    // the response should either go to the context api or redux store so that sidebar.js can consume it

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