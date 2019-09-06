// return an object of filters that can be passed to the appropriate layers
const createBoundaryFilter = boundingObj => {
    const { type, name, id } = {...boundingObj}

    let tileType, resetBaseLayer, resetBaseFilter, resetLineWidth, resetColor;

    // handle 
    if(type === 'municipality'){
        tileType = 'm'
        resetBaseLayer = 'county'
        resetBaseFilter = ['==', 'dvrpc', 'Yes']
        resetLineWidth = 2.5
        resetColor = '#fafafa'
    }else{
        tileType = 'c'
        resetBaseLayer = 'municipality'
        resetBaseFilter = null
        resetLineWidth = 0.5
        resetColor = '#e3f2fd'
    }
    
    const filter = {
        baseFilter: {
            layer: `${type}-outline`,
            filter: ['==', 'name', name],
        },
        resetFilter: {
            layer: `${resetBaseLayer}-outline`,
            filter: resetBaseFilter,
            width: resetLineWidth,
            color: resetColor
        },
        circlesFilter: {
            layer: 'crash-circles',
            filter: ["all",
                ['==', tileType, id],
                ['>', 'max_sever', '0'],
                ['<', 'max_sever', '3'],
            ]
        },
        heatFilter: {
            layer: 'crash-heat',
            filter: ['==', tileType, id]
        }
    }

    return filter
}

const removeBoundaryFilter = () => {
    return {
        county: {
            layer: 'county-outline',
            filter: ['==', 'dvrpc', 'Yes'],
            paint: {
                width: 2.5,
                color: '#fafafa'
            }
        },
        muni: {
            layer: 'municipality-outline',
            filter: null,
            paint: {
                width: 0.5,
                color: '#e3f2fd'
            }
        },
        // need to be smart here about remove the boundary filter but keeping the ksi/otherwise filter...
        circles: {
            layer: 'crash-circles',
            filter: ['any', 
            ['==', 'max_sever', '1'],
            ['==', 'max_sever', '2'],
        ]
        },
        heat: {
            layer: 'crash-heat',
            filter: ['any', 
            ['==', 'max_sever', '1'],
            ['==', 'max_sever', '2'],
        ]
        }
    }
}

export { createBoundaryFilter, removeBoundaryFilter }