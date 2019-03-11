import { severityLookup } from './mapLookups.js'


const options = {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
}

const getPopupInfo = async e => {
    const properties = e.features[0].properties
    const id = properties['crash_id']
    let severity = properties['max_sever']

    let output = {
        id,
        severity,
    }

    //@TODO: replace with endpoint URL
    const stream = await fetch(`https://a.michaelruane.com/api/crash-data/v1/popupInfo?id=${id}`, options)
    
    console.log('stream is ', stream)

    // return an error message if the fetch fails
    if(!stream.ok) return stream.statusText

    // otherwise get the reponse body and combine it with the existing output fields
    let response = await stream.json()

    console.log('response ', response)

    // remove [0] once the endpoint gets updated to not have features be an array
    response = response.features[0]

    // spread to combine the existing output object with the response fields
    // edit this depending on the response object, but assuming it's not nested this should work as-is
    output = {...output, ...response}

    return output
}

const setPopup = (popupInfo, popup, map) => {
    popupInfo.then(info => {
        info.collision_type = 'PLACEHOLDER UNTIL ENDPOINT IS UPDATED'
        info.severity = severityLookup[info.severity]

        popup.setHTML(`
            <h3 class="crash-popup-header">CRN: ${info.id}</h3>
            <hr />
            <p>Collision Type: ${info.collision_type}</p>
            <p>Max Severity: ${info.severity}</p>
            <p>Crash Date: ${info.month}, ${info.year}</p>
            <p>Number of persons involved: ${info.persons}</p>
            <p>Number of vehicles involved: ${info.vehicle_count}</p>
            <p>Number of pedestrians involved: ${info.ped}</p>
            <p>Number of bicyclists involved: ${info.bike}</p>
        `)
        .addTo(map)
    })
}

// handle popup failer
const catchPopupFail = (popup, map, id) => {
    popup.setHTML(`
        <h3 class="crash-popup-header">Opps!</h3>
        <p>Something went wrong and the data was unable to be fetched, please try again.</p>
        <p>If the issue persists, please contact <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a> and let him know that data for crash number ${id} is not available. Thank you. </p>
    `)
    .addTo(map)
}

export { getPopupInfo, setPopup, catchPopupFail }