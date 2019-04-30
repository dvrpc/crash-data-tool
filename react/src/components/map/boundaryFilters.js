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
            filter: ['==', tileType, id]
        },
        // @TODO: adjust the heatmap weight/intensity/radius so that boundaries don't all look like massive red blobs
        heatFilter: {
            layer: 'crash-heat',
            filter: ['==', tileType, id]
        }
    }

    return filter
}

export { createBoundaryFilter }