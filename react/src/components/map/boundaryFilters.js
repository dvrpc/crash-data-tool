/*
    VT update:
        Add the muni and cty field as originally planned. ID is already passed in at this point so filtering should be quick and easy
*/

// return an object of filters that can be passed to the appropriate layers
const createBoundaryFilter = boundingObj => {
    const { type, name, id } = {...boundingObj}
    
    // the VT's will have shortened names to keep them as small as possible
    let tileType = type === 'municipality' ? 'm' : 'c'
    
    const filter = {
        baseFilter: {
            layer: `${type}-outline`,
            filter: ['==', 'name', name],
        },
        circlesFilter: {
            layer: 'crash-circles',
            filter: ['==', tileType, id]
        },
        heatFilter: {
            layer: 'crash-heat',
            filter: ['==', tileType, id]
        }
    }

    return filter
}

export { createBoundaryFilter }