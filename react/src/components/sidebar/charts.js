// General bar chart options
const barOptions = (xlabel, ylabel) =>{
    return {
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: xlabel,
                    fontColor: '#0a0908'
                }
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: ylabel,
                    fontColor: '#0a0908'
                },
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
}


// Severity chart data
const severity = data => {
    return {
        labels: ['Fatal', 'Serious', 'Moderate', 'Minor', 'Unknown', 'Uninjured'],
        datasets: [{
            data,
            backgroundColor: ['#d62839', '#de5260','#e67e88','#93c7db','#4ba3c3','#e3e3e3']
        }]
    }
}


// Mode Chart data
const mode = data => {
    return {
        labels: ['Bicyclists', 'Pedestrians', 'Vehicle Occupants'],
        datasets: [{
            data,
            /*color options:
                dark red/brownish: 885a5a
                dark green: 498467
                orange: e3655b
                purple: 6457a6
                grey/purple: 747c92
                light purple: cfcfea
            */
            backgroundColor: '#6457a6'
        }]
    }
}


// Collision Type chart data
    // This function will eventually need more parameters because labels will not always be all 10 collision types - it will just be the collision types found in the selected area
    // that will affect backgroundColor as well. Handle it in the following way:
        // Create arrays for labels and backgroundColor with 10 values. Based off of the # of different collision types in the response, slice those arrays and set them as labels and backgroundColor, respectively
const collisionType = data => {
    return {
        labels: ['Non collision', 'Rear-end', 'Head on', 'Rear-to-rear (backing)', 'Angle', 'Sideswipe (same dir.)', 'Sideswipe (Opposite dir.)', 'Hit fixed object', 'Hit pedestrian', 'Other/Unknown'],
        datasets: [{
            data,
            backgroundColor: [
                '#b7b6c1','#c6e0ff','#dd403a', '#bad1cd', '#f2d1c9', '#e086d3', '#8332ac', '#a99985', '#89043d', '#aec3b0'
            ]
        }]
    }
}

export {severity, mode, barOptions, collisionType}