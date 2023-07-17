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
            id, '#f4a22d',
            '#e3f2fd'
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
                width: 2.5,
                color: '#969696'
            }
        },
        muni: {
            layer: 'municipality-outline',
            filter: null,
            paint: {
                width: 0.5,
                color: '#636363'
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

export { createBoundaryHighlight, removeBoundaryFilter }