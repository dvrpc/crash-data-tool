/**********************/
/****** Helpers ******/ 
// Fetch Options
const getOptions = {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
    }
}
const postOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
}


// Filters
// Crash Type Filters
const ksiNoBoundary = [
    ['==', 'max_sever', 1],
    ['==', 'max_sever', 2],
]
const ksiBoundary = [
    ['>', 'max_sever', 0],
    ['<', 'max_sever', 3]
]
const allBoundary = (tileType, id) => ['==', tileType, id]

// Range Filters
const rangeNoBoundary = (from, to) => {
    return [
        ['>=', 'year', from],
        ['<=', 'year', to]
    ]
}
const rangeBoundary = (from, to) => {
    return [
        ['>=', 'year', from],
        ['<=', 'year', to]
    ]
}


/**********************/
/****** ACTIONS ******/
const GET_DATA_FROM_KEYWORD = 'GET_DATA_FROM_KEYWORD'
const SET_MAP_CENTER = 'SET_MAP_CENTER'
const SET_MAP_BOUNDING = 'SET_MAP_BOUNDING'
const SET_SIDEBAR_HEADER_CONTEXT = 'SET_SIDEBAR_HEADER_CONTEXT'
const GET_BOUNDING_BOX = 'GET_BOUNDING_BOX'
const SET_MAP_FILTER = 'SET_MAP_FILTER'
const GET_POLYGON_CRNS = 'GET_POLYGON_CRNS'
const SIDEBAR_CRASH_TYPE = 'SIDEBAR_CRASH_TYPE'
const SIDEBAR_RANGE = 'SIDEBAR_RANGE'


/*****************************/
/****** ACTION CREATORS ******/
const get_data_from_keyword = data => ({ type: GET_DATA_FROM_KEYWORD, data })
const set_map_center = center => ({ type: SET_MAP_CENTER, center })
const set_map_bounding = bounding => ({ type: SET_MAP_BOUNDING, bounding })
const set_sidebar_header_context = area => ( { type: SET_SIDEBAR_HEADER_CONTEXT, area })
const get_bounding_box = bbox => ({ type: GET_BOUNDING_BOX, bbox })
const set_map_filter = filter => ({ type: SET_MAP_FILTER, filter })
const get_polygon_crns = polyCRNS => ({ type: GET_POLYGON_CRNS, polyCRNS })
const sidebar_crash_type = crashType => ({type: SIDEBAR_CRASH_TYPE, crashType})
const sidebar_range = range => ({type: SIDEBAR_RANGE, range})


/***********************/
/****** REDUCERS ******/
export default function mapReducer(state = [], action) {
    switch(action.type){
        case GET_DATA_FROM_KEYWORD:
            const data = action.data
            return Object.assign({}, state, { data })
        case SET_MAP_CENTER:
            const center = action.center
            return Object.assign({}, state, { center })
        case SET_MAP_BOUNDING:
            const bounding = action.bounding
            return Object.assign({}, state, { bounding })
        case SET_SIDEBAR_HEADER_CONTEXT:
            const area = action.area
            return Object.assign({}, state, { area })
        case GET_BOUNDING_BOX:
            const bbox = action.bbox
            return Object.assign({}, state, { bbox })
        case SET_MAP_FILTER:
            const filter = action.filter
            return Object.assign({}, state, { filter })
        case GET_POLYGON_CRNS:
            const polyCRNS = action.polyCRNS
            return Object.assign({}, state, { polyCRNS })
        case SIDEBAR_CRASH_TYPE:
            const crashType = action.crashType
            return Object.assign({}, state, { crashType })
        case SIDEBAR_RANGE:
            const range = action.range
            return Object.assign({}, state, { range })
        default:
            return state
    }
}


/**************************/
/****** DISPATCHERS ******/


/***** MAP Dispatchers *****/
export const getDataFromKeyword = boundaryObj => async dispatch => {
    const { type, name } = boundaryObj
    
    //  @BUG: SOME NJ municipalities return a blank object. The call is successful, it's just empty.
    // Ex. Mount Laurel Township fails, Camden City works. 
    
    const api = `https://alpha.dvrpc.org/api/crash-data/v2/sidebarInfo?type=${type}&value=${name}`
    const stream = await fetch(api, getOptions)

    //error handling - pass the failure message + the boundary object to give context to the displayed error response
    if(!stream.ok) {
        const failObj = { fail: stream.statusText, boundaryObj }
        dispatch(get_data_from_keyword(failObj))
    }else{
        const response = await stream.json()
        dispatch(get_data_from_keyword(response))
    }
}

export const setMapCenter = center => dispatch => dispatch(set_map_center(center))

export const setMapBounding = bounding => dispatch => {
    bounding.name = decodeURIComponent(bounding.name)
    dispatch(set_map_bounding(bounding))
}

export const setSidebarHeaderContext = area => dispatch => dispatch(set_sidebar_header_context(area))

export const getBoundingBox = id => async dispatch => {
    id = id.toString()

    let featureServer;
    let codeType;

    // 0 for Municipalities, 1 for Counties
    id.length > 5 ? featureServer = 0 : featureServer = 1

    // counties and munis have different code types
    featureServer ? codeType = `FIPS=${id}` : codeType = `GEOID_10=${id}` 

    // boundary query string w/appropriate featureServer & id 
    // @TODO: plug this back in when ESRI gets their stuff together
    //const api = `https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/DVRPC_Boundaries/FeatureServer/${featureServer}/query?where=${codeType}&geometryType=esriGeometryEnvelope&outSR=4326&returnExtentOnly=true&f=pgeojson`
    
    const backupAPI = `https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/DVRPC_Boundaries/FeatureServer/${featureServer}/query?where=${codeType}&geometryType=esriGeometryEnvelope&outSR=4326&returnExtentOnly=true&f=json`
    const stream = await fetch(backupAPI, postOptions)
    
    if(stream.ok) {
        // @BUG: ArcGIS is returning an invalid JSON object. It does not have a closing bracket. Awesome cool great job. 
        // @TODO: add this two liner back in when we got back to the regular api call
        // const response = await stream.json()
        // const bbox = response.bbox

        const response = await stream.json()
        const extent = response.extent
        const bbox = [extent.xmax, extent.ymax, extent.xmin, extent.ymin]

        dispatch(get_bounding_box(bbox))
    }else {
        // error handling @TODO this, but better (remove alert)
        alert('esri bbox call failed ', stream)
    }
}

// pass a bbox and get an array of CRN's to filter map tiles from polygons
export const getPolygonCrashes = bbox => async dispatch => {
    const api = `https://alpha.dvrpc.org/api/crash-data/v2/crashId?geojson=${bbox}`
    const stream = await fetch(api, getOptions)

    if(stream.ok) {
        const response = await stream.json()
        dispatch(get_polygon_crns(response))
    }else {
        console.log('get crashes from polygon failed because ', stream)
    }
}

// reset the polyCRNS on boundary removal
export const removePolyCRNS = () => dispatch => dispatch(get_polygon_crns(null))

// handle boundary, crash type and range
export const setMapFilter = filter => dispatch => {
    console.log('filter is ', filter)

    let mapFilter = []
    const boundary = filter.boundary
    let hasRange = Object.keys(filter.range).length

        // FILTER STATES:
        //     Boundary: ['all', [conditions]]
        //     No Boundary: ['any', [conditions]]

        // Range conditions: Range no boundary, range Boundary
        // Crash Type conditions: KSI no boundary, KSI Boundary, All no boundary, All Boundary

    if(boundary) {
        console.log('boundary case')
        const tileType = filter.tileType
        const id = filter.id
        mapFilter = ['all', ['==', tileType, id]]

        // handle range first
        if(hasRange) {
            const {from, to} = filter.range
            mapFilter = mapFilter.concat(rangeBoundary(tileType, id, from, to))
        }

        // handle crash type
        switch(filter.filterType) {
            case 'all':
                // replace existing filter with optimized allBoundary filter
                if(!hasRange) mapFilter = allBoundary(filter.tileType, filter.id)
                return
            default:
                mapFilter = mapFilter.concat(ksiBoundary)
        }
    } else {
        console.log('no boundary case')
        mapFilter = ['any']

        if(hasRange) {
            const {from, to} = filter.range
            const rangeFilter = rangeNoBoundary(from, to)
            mapFilter = mapFilter.concat(rangeFilter)
        }

        switch(filter.filterType) {
            case 'all':
                if(!hasRange) mapFilter = 'none'
                return
            default:
                mapFilter = mapFilter.concat(ksiNoBoundary)
        }
    }

    console.log('mapFilter is ', mapFilter)
    //dispatch(mapFilter)

    // OLD WAY
    // handle crash type and boundary OLD WAY
    // switch(filter.filterType) {
    //     case 'all':
    //         dispatch(set_map_filter(allBoundary(filter.tileType, filter.id)))
    //         return
    //     case 'all no boundary':
    //         dispatch(set_map_filter('none'))
    //         return
    //     case 'ksi':
    //         dispatch(set_map_filter(ksiBoundary(filter.tileType, filter.id)))
    //         return
    //     default: // ksi no boundary
    //         dispatch(set_map_filter(ksiNoBoundary))
    // }
    // OLD WAY
}


/***** SIDEBAR Dispatchers *****/
export const sidebarCrashType = type => dispatch => dispatch(sidebar_crash_type(type))

export const sidebarRange = range => dispatch => dispatch(sidebar_range(range))