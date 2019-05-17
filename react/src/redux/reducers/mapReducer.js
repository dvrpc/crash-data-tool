// Miscellaneous
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


/**********************/
/****** ACTIONS ******/
const GET_DATA_FROM_KEYWORD = 'GET_DATA_FROM_KEYWORD'
const SET_MAP_CENTER = 'SET_MAP_CENTER'
const SET_MAP_BOUNDING = 'SET_MAP_BOUNDING'
const SET_SIDEBAR_HEADER_CONTEXT = 'SET_SIDEBAR_HEADER_CONTEXT'
const GET_BOUNDING_BOX = 'GET_BOUNDING_BOX'


/*****************************/
/****** ACTION CREATORS ******/
const get_data_from_keyword = data => ({ type: GET_DATA_FROM_KEYWORD, data })
const set_map_center = center => ({ type: SET_MAP_CENTER, center })
const set_map_bounding = bounding => ({ type: SET_MAP_BOUNDING, bounding })
const set_sidebar_header_context = area => ( { type: SET_SIDEBAR_HEADER_CONTEXT, area })
const get_bounding_box = bbox => ( { type: GET_BOUNDING_BOX, bbox } )


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
        default:
            return state
    }
}


/**************************/
/****** DISPATCHERS ******/
export const getDataFromKeyword = boundaryObj => async dispatch => {
    const { type, name } = boundaryObj
    const api = `https://a.michaelruane.com/api/crash-data/v1/sidebarInfo?type=${type}&value=${name}`
    const stream = await fetch(api, getOptions)

    console.log('stream is ', stream)

    // error handling - pass the failure message + the boundary object to give context to the displayed error response
    if(!stream.ok) {
        const failObj = { fail: stream.statusText, boundaryObj }
        dispatch(get_data_from_keyword(failObj))
    }else{
        const response = await stream.json()
        console.log('respone is ', response)
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
    let featureServer;

    // 0 for Municipalities, 1 for Counties
    id.length > 2 ? featureServer = 0 : featureServer = 1

    // boundary query string w/appropriate featureServer & id
    const api = `https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/DVRPC_Boundaries/FeatureServer/${featureServer}/query?where=DOT_CODE=${id}&geometryType=esriGeometryEnvelope&outSR=4326&returnExtentOnly=true&f=pgeojson`

    const stream = await fetch(api, postOptions)
    
    if(stream.ok) {
        const response = await stream.json()
        const bbox = response.bbox

        dispatch(get_bounding_box(bbox))
    }else {
        // error handling
        alert('esri bbox call failed ', stream)
    }
}
