const createBoundaryHighlight = boundingObj => {
    let { type, id } = {...boundingObj}
    
    // handle PPA (add 100 because reasons...)
    if(type === 'philly') id = (parseInt(id) + 100)
    
    id = id.toString()

    const paintProps = { 
        layer:  `${type}-outline`,
        width: [
            'match', ['get', 'geoid'],
            id, 4,
            0.5
        ],
        color: [
            'match', ['get', 'geoid'],
            id, '#FAA82D',
            '#969696'
        ]
    }

    return paintProps
}

const removeBoundaryFilter = () => {
    return {
        county: {
            layer: 'county-outline',
            filter: ['==', 'dvrpc', 'Yes'],
            paint: {
                width: 1.5,
                color: '#969696'
            }
        },
        muni: {
            layer: 'municipality-outline',
            filter: null,
            paint: {
                width: 0.5,
                color: '#969696'
            }
        },
        philly: {
            layer: 'philly-outline',
            filter: null,
            paint: {
                width: 0.5,
                color: '#969696'
            }
        }
    }
}

export { createBoundaryHighlight, removeBoundaryFilter }