const countyOutline = {
    id: 'county-outline',
    type: 'line',
    source: 'Boundaries',
    'source-layer': 'county',
    paint: {
        'line-width': 2.5,
        'line-color': '#fafafa'
    },
    filter: [
        '==',
        'dvrpc',
        'Yes'
    ]
}

const countyFill = {
    id: 'county-fill',
    type: 'fill',
    source: 'Boundaries',
    'source-layer': 'county',
    layout: {},
    maxzoom: 8.4,
    paint: {
        'fill-outline-color': '#f7c59f',
        'fill-opacity': ['case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0
        ],
        'fill-color': 'rgba(0,0,0,0.1)'
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
    minzoom: 8.4,
    paint: {
        'line-width': 0.5,
        'line-color': '#e3f2fd'
    }
}

const municipalityFill = {
    id: 'municipality-fill',
    type: 'fill',
    source: 'Boundaries',
    'source-layer': 'municipalities',
    layout: {},
    minzoom: 8.4,
    paint: {
        'fill-outline-color': '#f7c59f',
        'fill-opacity': ['case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0
        ],
        'fill-color': 'rgba(0,0,0,0.1)'
    }
}

// geojson source
const phillyOutline = {
    id: 'philly-outline',
    type: 'line',
    source: 'PPA',
    minzoom: 8.4,
    paint: {
        'line-width': 0.5,
        'line-color': '#e3f2fd'
    }
}

const crashHeat = {
    id: 'crash-heat',
    type: 'heatmap',
    source: 'Crashes',
    'source-layer': 'crash',
    maxzoom: 11,
    filter: ['all',
        ['>', 'max_sever', -1],
        ['<', 'max_sever', 2],
        ['>=', 'year', 2016],
        ['<=', 'year', 2020]
    ],
    paint: {
        'heatmap-weight': [
            'interpolate', ['linear'], ['get', 'max_sever'],
            0, 2,
            1, 1.7,
            2, 1,
            3, 0.4,
            4, 0.1
        ],
        'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            8.2, 1,
            11, 1.5
        ],
        'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            8.2, 1.7,
            10, 2.5
        ],
        'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.40, '#e7e7fc',
            0.50, '#dddefa',
            0.60, '#bbbdf6',
            0.90, '#414770',
            1, '#372248'
        ]
    }
}

const crashCircles = {
    id: 'crash-circles',
    type: 'circle',
    source: 'Crashes',
    'source-layer': 'crash',
    minzoom: 11,
    filter: ['all',
        ['>', 'max_sever', -1],
        ['<', 'max_sever', 2],
        ['>=', 'year', 2016],
        ['<=', 'year', 2020]
    ],
    layout: {
    },
    paint: {
        'circle-color': [
            'match', ['get', 'max_sever'],
            0, '#c12433',
            1, '#de5260',
            2, '#fc9da6',
            3, '#6eb5cf',
            4, '#b6dae7',
            5, '#ffffff',
            'rgba(255,255,255,0)'
        ],
        'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            11, 2.6,
            16, 8,
        ]
    }
}

export { countyOutline, countyFill, municipalityOutline, municipalityFill, phillyOutline, crashHeat, crashCircles }