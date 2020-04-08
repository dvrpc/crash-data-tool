const createBoundaryFilter = boundingObj => {
    const { type, name } = {...boundingObj}
    const filter = {
        layer: `${type}-outline`,
        filter: ['==', 'name', name],
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