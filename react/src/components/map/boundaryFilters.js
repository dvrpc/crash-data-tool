const createBoundaryFilter = boundingObj => {
    let { type, id } = {...boundingObj}
    id = id.toString()

    // handle PPA (add 100 because reasons...)
    if(type === 'philly') id = (parseInt(id) + 100).toString()

    const filter = {
        layer: `${type}-outline`,
        filter: ['==', 'geoid', id],
    }
    
    // @TODO create variables for color and width based on type
    // muni and philly width 0.5
    // county width 2.5
    const width = [
        'match' ['get', 'geoid'],
        id, 4,
        0.5
    ]
    
    // muni and philly color are #e3f2fd
    // county outline color is #fafafa
    const color = [
        'match' ['get', 'geoid'],
        id, '#f4a22d',
        '#e3f2fd'
    ]

    // @UPDATE return paintProps instead of filter
    const paintProps = { width, color }

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