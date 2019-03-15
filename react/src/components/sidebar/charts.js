// Bar chart data and options
const bar = data => {
    return {
        labels: ['Fatal', 'Serious', 'Moderate', 'Minor', 'Unknown', 'Uninjured'],
        datasets: [{
            data,
            backgroundColor: '#424b54'
        }]
    }
}
const barOptions = {
    legend: {
        display: false
    },
    scales: {
        xAxes: [{
            scaleLabel: {
                display: true,
                labelString: 'Injury type',
                fontColor: '#0a0908'
            }
        }],
        yAxes: [{
            scaleLabel: {
                display: true,
                labelString: 'Number of persons',
                fontColor: '#0a0908'
            },
            ticks: {
                beginAtZero: true
            }
        }]
    }
}


// Pie chart data and options
const pie = data => {
    return {
        labels: ['Bicyclists', 'Pedestrians', 'Vehicle Occupants'],
        datasets: [{
            data,
            backgroundColor: [
                '#b7b6c1','#c6e0ff','#dd403a'
            ],
            // hover 4 shades darker than background color
            hoverBackgroundColor: [
                '#6d6d73','#68699','#842622'
            ]
        }]
    }
}

export {bar, barOptions, pie}