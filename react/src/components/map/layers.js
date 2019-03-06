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
    id: 'crashHeat',
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
            43, 2
        ],

        'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            13, 4
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

        //@TODO: add in the circles past a certain breakpoint 
    }
}

export { countyOutline, municipalityOutline, crashHeat }