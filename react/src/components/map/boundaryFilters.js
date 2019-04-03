// return the filter code that 
const createBoundaryFilter = boundingObj => {
    const { type, name } = {...boundingObj}

    const filter = {
        layer: `${type}-outline`,
        layerFilter: ['==', 'name', name],
        circlesFilter: ['Point', 'in', 'I need to get bounding box, I guess'],
        heatFilter: ['wtf is a heatmap? a polygon?', 'in', 'need bounding box']
    }

    return filter
}

export { createBoundaryFilter }