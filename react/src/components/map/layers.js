const countyOutline = {
    id: 'county-outline',
    type: 'line',
    source: 'Boundaries',
    'source-layer': 'county',
    paint: {
        'line-width': 2.5,
        'line-color': '#483d3f'
    },
    filter: [
        '==',
        'dvrpc',
        'Yes'
    ]
}

const municipalityOutline = {
    id: 'municipality-outline',
    type: 'line',
    source: 'Boundaries',
    'source-layer': 'municipalities',
    paint: {
        'line-width': 0.5,
        'line-color': '#b4b4b4'
    }
}

export { countyOutline, municipalityOutline }