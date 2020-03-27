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
const ksiFilter = [
    ['>', 'max_sever', 0],
    ['<', 'max_sever', 3],
]
const rangeFilter = (from, to) => {
    return [
        ['>=', 'year', parseInt(from)],
        ['<=', 'year', parseInt(to)]
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
/// MAP Dispatchers
export const getDataFromKeyword = boundaryObj => async dispatch => {
    const { type, name, isKSI } = boundaryObj
        
    const api = `https://alpha.dvrpc.org/api/crash-data/v1/summary?type=${type}&value=${name}&ksi_only=${isKSI}`
    console.log('api is ', api)
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

export const getPolygonCrashes = bbox => async dispatch => {
    const api = `https://alpha.dvrpc.org/api/crash-data/v1/crash-ids?geojson=${bbox}`
    const stream = await fetch(api, getOptions)

    if(stream.ok) {
        const response = await stream.json()
        dispatch(get_polygon_crns(response))
    }else {
        console.log('get crashes from polygon failed because ', stream)
    }
}

export const removePolyCRNS = () => dispatch => dispatch(get_polygon_crns(null))

// handle boundary, crash type and range
export const setMapFilter = filter => dispatch => {
    let mapFilter = []
    const boundary = filter.boundary
    const hasRange = Object.keys(filter.range).length
    const type = filter.filterType
    let noFilterCondition = 0

    // check for boundary
    if(boundary) {
        const tileType = filter.tileType
        const id = filter.id
        mapFilter = ['all', ['==', tileType, id]]
    }else{
        mapFilter = ['all']
        noFilterCondition++
    }

    // handle range
    if(hasRange) {
        const {from, to} = filter.range
        mapFilter = mapFilter.concat(rangeFilter(from, to))
    } else {
        noFilterCondition++
    }

    // handle crash type
    if(type === 'ksi'){
        mapFilter = mapFilter.concat(ksiFilter)
    }else {
        noFilterCondition++
    }

    // if no boundary or range and type all, no filter
    if(noFilterCondition === 3) mapFilter = 'none'

    dispatch(set_map_filter(mapFilter))
}

// SIDEBAR Dispatchers
export const sidebarCrashType = type => dispatch => dispatch(sidebar_crash_type(type))
export const sidebarRange = range => dispatch => dispatch(sidebar_range(range))