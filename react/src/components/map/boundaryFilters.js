const createBoundaryFilter = boundingObj => {
    let { type, id } = {...boundingObj}
    id = id.toString()

    // handle PPA (add 100 because reasons...)
    if(type === 'philly') id = (parseInt(id) + 100).toString()

    const filter = {
        layer: `${type}-outline`,
        filter: ['==', 'geoid', id],
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
        philly: {
            layer: 'philly-outline',
            filter: null,
            paint: {
                width: 0.5,
                color: '#e3f2fd'
            }
        }
    }
}

export { createBoundaryFilter, removeBoundaryFilter }