////
// Functions to process chart data
////
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
        labels: ['Fatal', 'Major', 'Minor', 'Uninjured', 'Unknown'],
        datasets: [{
            data,
            backgroundColor: ['#d62839','#e67e88','#93c7db','#4ba3c3','#e3e3e3']
        }]
    }
}
// Mode Chart data
const mode = data => {
    return {
        labels: ['Pedestrians', 'Bicyclists', 'Vehicle Occupants'],
        datasets: [{
            data,
            backgroundColor: ['#6457a6', '#dd403a','#c6e0ff']
        }]
    }
}
// Collision Type chart data
const collisionType = data => {
    return {
        labels: ['Angle', 'Head on', 'Hit fixed object', 'Hit pedestrian', 'Non-collision', 'Other/Unknown', 'Rear-end',  'Rear-to-rear (backing)', 'Sideswipe (Opposite dir.)', 'Sideswipe (same dir.)'],
        datasets: [{
            data,
            backgroundColor: ['#b7b6c1','#c6e0ff','#dd403a', '#bad1cd', '#f2d1c9', '#e086d3', '#8332ac', '#a99985', '#89043d', '#aec3b0']
        }]
    }
}


////
// Functions to build the charts
////
// initialize empty charts
const makePlaceholders = () => {
    const collisionTypeChart = collisionType([0,0,0,0,0,0,0,0,0,0])
    const severityChart = severity([0,0,0,0,0])
    const modeChart = mode([0,0,0])
    return { collisionTypeChart, severityChart, modeChart }
}
// using the API response to build the actual charts
const makeCharts = data => {
    let severityChart, modeChart, collisionTypeChart;

    const output = {
        mode: [],
        severity: [],
        type: []
    }

    // with the current split, we need to loop through every year of data, and loop through the values in those years to extract and combine each number...
    // @TODO: improve this. If Marco/Kevin approve, redo the API response to aggregates instead of yearly breakdown, otherwise figure out a better way to extract the data
    for(var year in data){
        const x = data[year]

        Object.keys(x).forEach(key => {

            const innerObj = x[key]

            Object.keys(innerObj).forEach((innerKey, index) => {
                if(output[key][index] > -1){
                    output[key][index] += innerObj[innerKey]
                }else{
                    output[key].push(innerObj[innerKey])
                }
            })
        })
    }

    severityChart = severity(output.severity)
    modeChart = mode(output.mode)
    collisionTypeChart = collisionType(output.type)

    return { severityChart, modeChart, collisionTypeChart }
}

export { makeCharts, makePlaceholders, barOptions }