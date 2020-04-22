////
// Functions to process chart data
////
// General bar chart options
const chartOptions = (xlabel, ylabel) =>{
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
        labels: ['Fatal', 'Major', 'Moderate', 'Minor', 'Uninjured', 'Unknown Injury', 'Unknown Severity'],
        datasets: [{
            data,
            backgroundColor: ['#d62839','#e67e88','#e6887e','#93c7db','#4ba3c3','#e3e3e3', '#e3e3e3']
        }]
    }
}
// Mode Chart data
const mode = data => {
    return {
        labels: ['Bicyclists', 'Vehicle Occupants', 'Pedestrians'],
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
// Crashes over Time chart data
const formatYears = years => {
    let yearsFormatted = []

    if(years) {
        let {from, to} = years
        to = parseInt(to) + 1
        for(var i = from; i < to; i++) {
            yearsFormatted.push(i)
        }
    }else{
        yearsFormatted = [2014,2015,2016,2017,2018]
    }

    return yearsFormatted
}
const trend = (data, years) => {
    years = formatYears(years)
    return {
        labels: years,
        datasets: [{
            data
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
    const trendChart = trend([0,0,0,0,0,0],null)
    return { collisionTypeChart, severityChart, modeChart, trendChart }
}

// helper function to sum severity into trend
const sum = obj => Object.keys(obj).reduce((acca, cur) => acca + obj[cur], 0)

// transform db response into a format the charting functions can consume
const formatData = (yearData, output) => {
    Object.keys(yearData).forEach(key => {
    
        const innerObj = yearData[key]

        // quick hack to handle trend b/c no db response for it
        if(key === 'severity') output.trend.push(sum(innerObj))
    
        Object.keys(innerObj).forEach((innerKey, index) => {
            if(output[key][index] > -1){
                output[key][index] += innerObj[innerKey]
            }else{
                output[key].push(innerObj[innerKey])
            }
        })
    })
}

// default call that formats all available years of data
const hasAllYears = (data, output) => {
    for(var year in data){
        const yearData = data[year]
        formatData(yearData, output)
    }

    return output
}

// accepts a custom range and formats specified years of data into a format that can be consuemd by chart functions
const hasSetRange = (data, range, output) => {
    for(var year in data){
        if(year >= range.from && year <= range.to){
            const yearData = data[year]
            formatData(yearData, output)
        }
    }

    return output
}

// using the API response to build the actual charts
const makeCharts = (data, range) => {
    if(!data) return makePlaceholders()

    let severityChart, modeChart, collisionTypeChart, trendChart;

    let output = {
        mode: [],
        severity: [],
        type: [],
        trend: []
    }

    // determine whether to build chart data for all years or a specified range of years
    range ? output = hasSetRange(data, range, output) : output = hasAllYears(data, output)
    
    severityChart = severity(output.severity)
    modeChart = mode(output.mode)
    collisionTypeChart = collisionType(output.type)
    trendChart = trend(output.trend, range)

    return { severityChart, modeChart, collisionTypeChart, trendChart }
}

export { makeCharts, makePlaceholders, chartOptions }