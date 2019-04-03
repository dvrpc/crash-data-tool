// lookup table for the encoded VT county names
const countyLookup = {
    'Bucks': 0,
    'Chester': 1,
    'Delaware': 2,
    'Montgomery': 3,
    'Philadelphia': 4
}

// return an object of filters that can be passed to the appropriate layers
const createBoundaryFilter = boundingObj => {
    const { type, name } = {...boundingObj}
    
    // the VT's will have shortened names to keep them as small as possible
    const tileType = type === 'municipality' ? 'm' : 'c'
    
    // county names will be coded as numbers in the VT to cut down on size, so make the conversion here
    const heatName = countyLookup[name]
    
    // munis are going to be a problem because there's too many to make a lookup table and their names aren't even unique
    // storing geoid is (relatively) short and unique, but how does this app get geoid? As part of the munis dropdown? TBD
    const circleName = 'municipalities are a pain in the ass'

    const filter = {
        baseFilter: {
            layer: `${type}-outline`,
            filter: ['==', 'name', name],
        },
        circlesFilter: {
            layer: 'crash-circles',
            filter: ['==', tileType, circleName]
        },
        heatFilter: {
            layer: 'crash-heat',
            filter: ['==', tileType, heatName]
        }
    }

    return filter
}

export { createBoundaryFilter }