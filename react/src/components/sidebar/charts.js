////
// Functions to process chart data
////
// General chart options
const chartOptions = (xlabel, ylabel, customPadding) =>{
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
                },
                offset: true
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
        },
        layout: {
            padding: customPadding
        }
    }
}
// transform db response into a format the charting functions can consume
const formatData = (yearData, output) => {
    Object.keys(yearData).forEach(key => {
        const innerObj = yearData[key]

        if(!innerObj) return // escape empty years
        
        const innerKeys = Object.keys(innerObj)

        // extract data from years into correct locations
        if(innerKeys.length){
            Object.keys(innerObj).forEach(innerKey => {
                output[key][innerKey] = output[key][innerKey] ? innerObj[innerKey] + output[key][innerKey] : innerObj[innerKey]
            })
        }else {
            output.trend.push(innerObj)
        }
    })
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
const severity = rawData => {
    let labels = []
    let data = []

    for(const prop in rawData) {
        labels.push(prop)
        data.push(rawData[prop])
    }

    return {
        labels,
        datasets: [{
            data,
            backgroundColor: ['#c12433','#e67e88','#e6887e','#93c7db','#4ba3c3','#cacaca', '#e3e3e3']
        }]
    }
}
const mode = rawData => {
    let labels = []
    let data = []

    for(const prop in rawData) {
        labels.push(prop)
        data.push(rawData[prop])
    }

    return {
        labels,
        datasets: [{
            data,
            backgroundColor: ['#6457a6', '#DB7C26','#c6e0ff'],
            borderWidth: 0
        }]
    }
}
const collisionType = rawData => {
    let labels = []
    let data = []

    for(const prop in rawData) {
        labels.push(prop)
        data.push(rawData[prop])
    }

    return {
        labels,
        datasets: [{
            data,
            backgroundColor: ['#8dd3c7','#FFEC81','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9', '#bc80bd'],
            borderWidth: 0
        }]
    }
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


////
// Functions to build the charts
////
// initialize empty charts
const makePlaceholders = () => {
    const collisionTypeChart = collisionType({'Non-collision':0, 'Rear-end':0, 'Head-on':0, 'Rear-to-rear (backing)':0, 'Angle':0, 'Sideswipe (same direction)':0, 'Sideswipe (opposite direction)':0, 'Hit fixed object':0, 'Hit pedestrian':0, 'Other or unknown':0})
    const severityChart = severity({'Fatality':0,'Suspected Serious Injury':0,'Suspected Minor Injury':0,'Possible Injury':0,'Not Injured':0,'Unknown Injury':0,'Unknown if Injured':0})
    const modeChart = mode({Bicyclists: 0,Pedestrians: 0,'Vehicle Occupants':0})
    const trendChart = trend([0,0,0,0,0,0],null)
    return { collisionTypeChart, severityChart, modeChart, trendChart }
}
// using the API response to build the actual charts
const makeCharts = (data, range) => {
    if(!data) return makePlaceholders()

    let severityChart, modeChart, collisionTypeChart, trendChart;
    let output = {
        mode: {},
        severity: {},
        type: {},
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