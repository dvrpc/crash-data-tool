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

const crashHeat = {
    id: 'crash-heat',
    type: 'heatmap',
    source: 'Crashes',
    'source-layer': 'crash',
    maxzoom: 11,
    // KSI: Killed or severely injured
    filter: ['any', 
        ['==', ['get', 'max_sever'], 0],
        ['==', ['get', 'max_sever'], 1],
    ],
    paint: {
        'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'max_sever'],
            0, 2,
            1, 1.7,
            2, 0.9,
            3, 0.6,
            4, 0.3,
            5, 0.1,
        ],
        'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8.2, 1,
            11, 1.5
        ],
        'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8.2, 1.5,
            11, 2.5
        ],
        'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.20, '#f8f8fe',
            0.40, '#dddefa',
            0.60, '#bbbdf6',
            0.80, '#414770',
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
    filter: ['any',
        ['==', ['get', 'max_sever'], 0],
        ['==', ['get', 'max_sever'], 1],
    ],
    paint: {
        'circle-color': [
            'match',
            ['get', 'max_sever'],
            0, '#d62839',
            1, '#de5260',
            2, '#fc9da6',
            3, '#6eb5cf',
            4, '#b6dae7',
            5, '#ffffff',
            'rgba(255,255,255,0)'
        ],
        'circle-radius': [
            'case',
            ['boolean',
                ['feature-state', 'hover'], false
            ],
            4,
            7
        ],
        'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            11, 0.7,
            22, 1
        ]
    }
}

export { countyOutline, countyFill, municipalityOutline, municipalityFill, crashHeat, crashCircles }