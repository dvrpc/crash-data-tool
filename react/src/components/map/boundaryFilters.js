const createBoundaryFilter = boundingObj => {
    let { type, id } = {...boundingObj}
    id = id.toString()

    const filter = {
        layer: `${type}-outline`,
        filter: ['==', 'geoid', id],
    }

    console.log('filter ', filter)
    // a shitty hack here would be to check if !type and do the philly neighborhoods that way...

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