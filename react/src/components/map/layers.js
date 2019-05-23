/*
    @TODO: change the filtering back to integers once the VT's are fixed.
    crashHeat: max sever '1' and '2' back to 1 and 2
    crashCircles: circle-color paint property '1', '2', etc., back to 1, 2, etc
*/

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
        'fill-color': '#f7c59f',
        // set up muni outlines to have hover effects calculated by map.setFeatureState
        'fill-opacity': ['case',
            ['boolean', ['feature-state', 'hover'], false],
            0.9,
            0
        ],
    }
}

const crashHeat = {
    id: 'crash-heat',
    type: 'heatmap',
    source: 'Crashes',
    'source-layer': 'pa-crash',
    maxzoom: 13,
    // KSI: Killed or severely injured
    filter: ['any', 
        ['==', ['get', 'max_sever'], '1'],
        ['==', ['get', 'max_sever'], '2'],
    ],
    paint: {
        'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'max_sever'],
            1, 2.5,
            2, 1
        ],
        'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            13, 2
        ],
        'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8.2, 8,
            13, 3
        ],
        'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.16, '#4ba3c3',
            0.33, '#6eb5cf',
            0.5, '#93c7db',
            0.66, '#e67e88',
            0.83, '#de5260',
            1, '#d62839'
        ]
    }
}

const crashCircles = {
    id: 'crash-circles',
    type: 'circle',
    source: 'Crashes',
    'source-layer': 'pa-crash',
    minzoom: 13,
    filter: ['any', 
        ['==', ['get', 'max_sever'], '1'],
        ['==', ['get', 'max_sever'], '2'],
    ],
    paint: {
        /*
            0: Not injured, 1: killed, 2: major, 3: moderate, 4: minor, 8: injury/unknown severity, 9: unknown
        */
        'circle-color': [
            'match',
            ['get', 'max_sever'],
            '0', '#f7f7f7',
            '1', '#d62839',
            '2', '#de5260',
            '3', '#e67e88',
            '4', '#93c7db',
            '8', '#6eb5cf',
            '9', '#4ba3c3',
            'rgba(255,255,255,0)'
        ],
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13, 5,
            22, 20
        ],
        'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13, 0.7,
            22, 1
        ]
    }
}

export { countyOutline, municipalityOutline, municipalityFill, crashHeat, crashCircles }