// return an object of filters that can be passed to the appropriate layers
const createBoundaryFilter = boundingObj => {
    const { type, name } = {...boundingObj}
    
    let resetBaseLayer, resetBaseFilter, resetLineWidth, resetColor;

    // @TODO: remove all the reset stuff. Only need to return baseFilter...
    if(type === 'municipality'){
        resetBaseLayer = 'county'
        resetBaseFilter = ['==', 'dvrpc', 'Yes']
        resetLineWidth = 2.5
        resetColor = '#fafafa'
    }else{
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
        }
    }
}

export { createBoundaryFilter, removeBoundaryFilter }