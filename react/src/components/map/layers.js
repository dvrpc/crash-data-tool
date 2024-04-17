import { defaultRange } from "../../redux/reducers/mapReducer"

const countyOutline = {
    id: 'county-outline',
    type: 'line',
    source: 'Boundaries',
    'source-layer': 'county',
    paint: {
        'line-width': 2.5,
        'line-color': '#969696'
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
        'line-color': '#636363'
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
        // @UPDATE: start and end year 
        ['>=', 'year', defaultRange.from],
        ['<=', 'year', defaultRange.to]
    ],
    paint: {
        'heatmap-weight': [
            'interpolate', ['linear'], ['get', 'max_sever'],
            0, 3,
            1, 2.5,
            2, 1.5,
            3, 1,
            4, 0.5,
            5, 0.25
        ],
        'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            8.3, 1,
            11, 1.5
        ],
        'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            8.3, 1,
            10, 2.7
        ],
        'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.15, '#feebe2',
            0.30, '#fcc5c0',
            0.45, '#fa9fb5',
            0.60, '#f768a1',
            0.80, '#c51b8a',
            1, '#7a0177'
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
        // @UPDATE: start and end year
        ['>=', 'year', defaultRange.from],
        ['<=', 'year', defaultRange.to]
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
        ],
        'circle-stroke-color': '#e1e1e1',
        'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2.5,
            0
        ]
    }
}

export { countyOutline, countyFill, municipalityOutline, municipalityFill, phillyOutline, crashHeat, crashCircles }