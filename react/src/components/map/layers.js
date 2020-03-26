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
    maxzoom: 8.5,
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
    minzoom: 8.5,
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
    minzoom: 8.5,
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
        ['==', ['get', 'max_sever'], 1],
        ['==', ['get', 'max_sever'], 2],
    ],
    paint: {
        'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'max_sever'],
            1, 2,
            2, 1,
            3, 0.6,
            4, 0.3,
            5, 0.1,
            6, 0.08,
            7, 0.05,
            8, 0.02
        ],
        'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8.2, 1,
            11, 2
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
        ['==', ['get', 'max_sever'], 1],
        ['==', ['get', 'max_sever'], 2],
    ],
    paint: {
        /*
            0: Not injured, 1: killed, 2: major, 3: moderate, 4: minor, 8: injury/unknown severity, 9: unknown
        */
        'circle-color': [
            'match',
            ['get', 'max_sever'],
            0, '#f7f7f7',
            1, '#d62839',
            2, '#de5260',
            3, '#e67e88',
            4, '#93c7db',
            8, '#6eb5cf',
            9, '#4ba3c3',
            'rgba(255,255,255,0)'
        ],
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            11, 5,
            22, 20
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