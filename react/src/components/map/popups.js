import { severityLookup } from './mapLookups.js'

const options = {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
}

const getPopupInfo = async crash => {
    const crn = crash.crn
    const severity = crash.severity

    let output = {
        crn,
        severity,
    }

    const stream = await fetch(`https://alpha.dvrpc.org/api/crash-data/v1/popupInfo?id=${crn}`, options)
    
    // return an error message if the fetch fails
    if(!stream.ok) return {fail: stream.statusText, crn}

    // otherwise get the reponse body and combine it with the existing output fields
    let response = await stream.json()

    response = response.features
    output = {...output, ...response}

    return output
}

const setPopup = popupInfo => {
    popupInfo.severity = severityLookup[popupInfo.severity]

    return `
        <h3 class="crash-popup-header">CRN: ${popupInfo.crn}</h3>
        <hr />
        <p>Collision Type: ${popupInfo.collision_type}</p>
        <p>Max Severity: ${popupInfo.severity}</p>
        <p>Crash Date: ${popupInfo.month}, ${popupInfo.year}</p>
        <p>Persons involved: ${popupInfo.persons}</p>
        <p>Vehicles involved: ${popupInfo.vehicle_count}</p>
        <p>Pedestrians involved: ${popupInfo.ped}</p>
        <p>Bicyclists involved: ${popupInfo.bike}</p>
    `
}

// handle popup failure
const catchPopupFail = crn => {
    return `
        <h3 class="crash-popup-header">Oops!</h3>
        <p>Something went wrong and the data was unable to be fetched, please try again.</p>
        <p>If the issue persists, please contact <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a> and let him know the data for crash number <strong>${crn}</strong> is not available. Thank you. </p>
    `
}

export { getPopupInfo, setPopup, catchPopupFail }