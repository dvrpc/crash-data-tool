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

    const stream = await fetch(`https://cloud.dvrpc.org/api/crash-data/v1/crashes/${crn}`, options)
    
    // return an error message if the fetch fails
    if(!stream.ok) return {fail: stream.statusText, crn}

    // otherwise get the reponse body and combine it with the existing output fields
    let response = await stream.json()
    output = {...output, ...response}
    return output
}

const setPopup = (popupInfo, index, length) => {
    return `
        <h3 class="crash-popup-header">Crash Record Number: ${popupInfo.crn.substring(2)}</h3>
        <ul id="crash-popup-ul">
            <li>Collision Type: ${popupInfo['Collision type']}</li>
            <li>Max Severity: ${popupInfo['Maximum severity'] || 'Unknown'}</li>
            <li>Crash Date: ${popupInfo.Month}, ${popupInfo.Year}</li>
            <li>Vehicles Involved: ${popupInfo.Vehicles}</li>
            <li>Vehicle Occupants Involved: ${popupInfo['Vehicle occupants']}</li>
            <li>Pedestrians Involved: ${popupInfo.Pedestrians}</li>
            <li>Bicyclists Involved: ${popupInfo.Bicyclists}</li>
        </ul>
        <div id="crash-popup-pagination">
            <button id="crash-previous-popup" class="hover-btn"><</button>
            <p>${index} of ${length}</p>
            <button id="crash-next-popup" class="hover-btn">></button>
        </div>
    `
}

// handle popup failure
const catchPopupFail = crn => {
    return `
        <h3 class="crash-popup-header">Sorry!</h3>
        <p>Something went wrong and the data was unable to be fetched, please try again.</p>
        <p>If the issue persists, please contact <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a> and let him know the data for crash number <strong>${crn}</strong> is not available. Thank you. </p>
    `
}

export { getPopupInfo, setPopup, catchPopupFail }