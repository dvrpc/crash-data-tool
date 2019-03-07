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
    paint: {
        'line-width': 0.5,
        'line-color': '#e3f2fd'
    }
}

const crashHeat = {
    id: 'crash-heat',
    type: 'heatmap',
    source: 'Crashes',
    'source-layer': 'pa-crash',

    // @TODO: explore maxzoom
    maxzoom: 13,
    paint: {
        'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'TOT_INJ_CO'],
            0, 0,
            43, 2.5
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
            13, 5
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
    paint: {
        // as of now, these numbers are baesd off of the TOT_INJ_CO ranges
        // update them after we switch over to MAX_SEVERI
        'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'TOT_INJ_CO'],
            0, '#f7f7f7',
            1, '#4ba3c3',
            2, '#6eb5cf',
            3, '#93c7db',
            15, '#e67e88',
            30, '#de5260',
            43, '#d62839'
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

export { countyOutline, municipalityOutline, crashHeat, crashCircles }