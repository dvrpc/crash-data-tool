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
    ['>', 'max_sever', -1],
    ['<', 'max_sever', 2],
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
const SET_POLYGON_BBOX = 'SET_POLYGON_BBOX'
const SIDEBAR_CRASH_TYPE = 'SIDEBAR_CRASH_TYPE'
const SIDEBAR_RANGE = 'SIDEBAR_RANGE'
const SET_SRC = 'SET_SRC'
const SET_MAP_LOADING = 'SET_MAP_LOADING'


/*****************************/
/****** ACTION CREATORS ******/
const get_data_from_keyword = data => ({ type: GET_DATA_FROM_KEYWORD, data })
const set_map_center = center => ({ type: SET_MAP_CENTER, center })
const set_map_bounding = bounding => ({ type: SET_MAP_BOUNDING, bounding })
const set_sidebar_header_context = area => ( { type: SET_SIDEBAR_HEADER_CONTEXT, area })
const get_bounding_box = bbox => ({ type: GET_BOUNDING_BOX, bbox })
const set_map_filter = filter => ({ type: SET_MAP_FILTER, filter })
const get_polygon_crns = polyCRNS => ({ type: GET_POLYGON_CRNS, polyCRNS })
const set_polygon_bbox = polygonBbox => ({type: SET_POLYGON_BBOX, polygonBbox })
const sidebar_crash_type = crashType => ({type: SIDEBAR_CRASH_TYPE, crashType})
const sidebar_range = range => ({type: SIDEBAR_RANGE, range})
const set_src = src => ({type: SET_SRC, src})
const set_map_loading = status => ({type: SET_MAP_LOADING, status })


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
        case SET_POLYGON_BBOX:
            const polygonBbox = action.polygonBbox
            return Object.assign({}, state, { polygonBbox })
        case SIDEBAR_CRASH_TYPE:
            const crashType = action.crashType
            return Object.assign({}, state, { crashType })
        case SIDEBAR_RANGE:
            const range = action.range
            return Object.assign({}, state, { range })
        case SET_SRC:
            const src = action.src
            return Object.assign({}, state, { src })
        default:
            return state
    }
}


/**************************/
/****** DISPATCHERS ******/
/// MAP Dispatchers
export const getDataFromKeyword = boundaryObj => async dispatch => {
    const { geoID, geojson, isKSI } = boundaryObj
    
    // handle geography & polygon queries    
    const query = geojson === undefined ? `geoid=${geoID}&ksi_only=${isKSI}` : `geojson=${geojson}&ksi_only=${isKSI}`
    const api = `https://alpha.dvrpc.org/api/crash-data/v1/summary?${query}`  

    try{
        const stream = await fetch(api, getOptions)
        const response = await stream.json()
        dispatch(get_data_from_keyword(response))
    }catch(error) {
        console.error(error)
        alert(`Sorry! Data could not be fetched at this moment. Please try again later.`)
    }
}
export const setMapFilter = filter => dispatch => {
    // handle boundary, crash type and range
    let mapFilter = []
    const boundary = filter.boundary
    const hasRange = Object.keys(filter.range).length
    const type = filter.filterType
    let noFilterCondition = 0

    // check for boundary
    if(boundary) {
        const tileType = filter.tileType
        const id = parseInt(filter.id)
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
    if(type === 'KSI'){
        mapFilter = mapFilter.concat(ksiFilter)
    }else {
        noFilterCondition++
    }

    // if no boundary or range and type all, no filter
    if(noFilterCondition === 3) mapFilter = 'none'

    console.log('mapFilter is ', mapFilter)
    dispatch(set_map_filter(mapFilter))
}

export const setMapCenter = center => dispatch => dispatch(set_map_center(center))

export const setMapBounding = bounding => dispatch => dispatch(set_map_bounding(bounding))

export const setSidebarHeaderContext = area => dispatch => dispatch(set_sidebar_header_context(area))

export const getBoundingBox = id => async dispatch => {
    const philly = id.toString()
    let featureServer;
    let codeType;
    let query;

    // select feature server and code type based on query type
    if(philly.substring(0, 6) === '421016') {
        // api expects geoid +100 for reasons
        id += 100
        query = `https://arcgis.dvrpc.org/portal/rest/services/Boundaries/DVRPC_MCD_PhiCPA/FeatureServer/0/query?where=geoid='${id}'&geometryType=esriGeometryEnvelope&outSR=4326&returnExtentOnly=true&f=json`
    }else {
        if(id.toString().length > 5 ) {
            featureServer = 'MunicipalBoundaries'
            codeType = `geoid_10='${id}'` 
        } else {
            featureServer = 'CountyBoundaries'
            codeType = `FIPS='${id}'`
        }

        query = `https://arcgis.dvrpc.org/portal/rest/services/Boundaries/${featureServer}/FeatureServer/0/query?where=${codeType}&geometryType=esriGeometryEnvelope&outSR=4326&returnExtentOnly=true&f=json`
    }

    const stream = await fetch(query, postOptions)
    
    if(stream.ok) {
        const response = await stream.json()
        const extent = response.extent
        
        // ESRI returns the same object regardless of success or fail so check for extent AND contents of extent
        if (!extent || extent.xmin === "NaN") {
            console.log('bbox call returned null extent')
            alert('Sorry! The automatic pan/zoom feature service is currently unavailable.\nPlease zoom to your selected geography using either your mouse or the +/- overlays on the map. Thank you.')
            return
        }
        const bbox = [extent.xmax, extent.ymax, extent.xmin, extent.ymin]

        dispatch(get_bounding_box(bbox))
    }else {
        console.error('esri bbox call failed ', stream)
        alert('Sorry! The automatic pan/zoom feature service is currently unavailable.\nPlease zoom to your selected geography using either your mouse or the +/- overlays on the map. Thank you.')
        return
    }
}

export const getPolygonCrashes = bbox => async dispatch => {
    try{
        const api = `https://alpha.dvrpc.org/api/crash-data/v1/crash-ids?geojson=${bbox}`
        const stream = await fetch(api, getOptions)
        const response = await stream.json()
        dispatch(get_polygon_crns(response))
    }catch(error) {
        console.error(error)
        alert(`Sorry! Data could not be fetched at this moment. Please try again later.`)
    }
}

export const setPolygonBbox = formattedBbox => dispatch => dispatch(set_polygon_bbox(formattedBbox))

export const removePolyCRNS = () => dispatch => dispatch(get_polygon_crns(null))


// SIDEBAR Dispatchers
export const sidebarCrashType = type => dispatch => dispatch(sidebar_crash_type(type))
export const sidebarRange = range => dispatch => dispatch(sidebar_range(range))
export const setSrc = src => dispatch => dispatch(set_src(src))

// Map State
export const setMapLoading = status => dispatch => dispatch(set_map_loading(status))