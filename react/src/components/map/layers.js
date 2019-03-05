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

const crashHeat = {
    id: 'crashHeat',
    type: 'heatmap',
    source: 'Crashes',

    // @TODO: change this depending on what the layer name is
    'source-layer': 'Crashes',

    // @TODO: explore maxzoom
    maxzoom: 9,
    paint: {
        'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'MAX_SEVERI'],
            0, 0,
            8, 0
        ],

        // @TODO: edit this - straight from the example
        'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3
        ],

        // It seems like this assigns color based on density of crashes, which raises a good question for the meeting:
            // Should crash severity or crash density determine the heatmap? Does severity even matter, or is that only for the sidebar breakdown?
            // Ultimately, people are interested in # of crashes over an area to see *if* it's dangerous and the sidebar breakdown can tell them *how* dangerous it is
        'heatmap-color': [
            'interpolate',
            ['linear'],
            ['MAX_SEVERI'],
            0, '#2166ac',
            0.125, '#4393c3',
            0.25, '#92c5de',
            0.375, '#d1e5f0',
            0.5, '#f7f7f7',
            0.625, '#fddbc7',
            0.75, '#f4a582',
            0.875, '#d6604d',
            1, '#b2182b',
        ]

        //@TODO: add in the circles past a certain breakpoint 
    }
}

export { countyOutline, municipalityOutline, crashHeat }