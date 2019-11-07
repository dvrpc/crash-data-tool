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
const SET_MAP_FILTER = 'SET_MAP_FILTER'

// @TODO: polygon jawn
const GET_POLYGON_CRNS = 'GET_POLYGON_CRNS'
const GET_POLYGON_CRASHES = 'GET_POLYGON_CRASHES'


/*****************************/
/****** ACTION CREATORS ******/
const get_data_from_keyword = data => ({ type: GET_DATA_FROM_KEYWORD, data })
const set_map_center = center => ({ type: SET_MAP_CENTER, center })
const set_map_bounding = bounding => ({ type: SET_MAP_BOUNDING, bounding })
const set_sidebar_header_context = area => ( { type: SET_SIDEBAR_HEADER_CONTEXT, area })
const get_bounding_box = bbox => ({ type: GET_BOUNDING_BOX, bbox })
const set_map_filter = filter => ({ type: SET_MAP_FILTER, filter })

// @TODO: polygon jawn
const get_polygon_crns = polyCRNS => ({ type: GET_POLYGON_CRNS, polyCRNS })
const get_polygon_crashes = polyCrashes => ({ type: GET_POLYGON_CRASHES, polyCrashes})


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

        // @TODO: polygon jawn
        case GET_POLYGON_CRNS:
            const polyCRNS = action.polyCRNS
            return Object.assign({}, state, { polyCRNS })
        case GET_POLYGON_CRASHES:
            const polyCrashes = action.polyCrashes
            return Object.assign({}, state, { polyCrashes })
        default:
            return state
    }
}


/**************************/
/****** DISPATCHERS ******/
export const getDataFromKeyword = boundaryObj => async dispatch => {
    const { type, name } = boundaryObj
    
    const api = `https://alpha.dvrpc.org/api/crash-data/v2/sidebarInfo?type=${type}&value=${name}`
    const stream = await fetch(api, getOptions)

    // error handling - pass the failure message + the boundary object to give context to the displayed error response
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
    const api = `https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/DVRPC_Boundaries/FeatureServer/${featureServer}/query?where=${codeType}&geometryType=esriGeometryEnvelope&outSR=4326&returnExtentOnly=true&f=pgeojson`
    const stream = await fetch(api, postOptions)
    
    if(stream.ok) {
        const response = await stream.json()
        const bbox = response.bbox

        dispatch(get_bounding_box(bbox))
    }else {
        // error handling @TODO this, but better (remove alert)
        alert('esri bbox call failed ', stream)
    }
}

export const setMapFilter = filter => dispatch => {
    const ksiNoBoundary = ['any', 
        ['==', 'max_sever', 1],
        ['==', 'max_sever', 2],
    ]
    const ksiBoundary = (tileType, id) => {
        const filter = ['all',
            ['==', tileType, id],
            ['>', 'max_sever', 0],
            ['<', 'max_sever', 3]
        ]
        return filter
    }
    const allBoundary = (tileType, id) => ['==', tileType, id]

    switch(filter.filterType) {
        case 'all':
            dispatch(set_map_filter(allBoundary(filter.tileType, filter.id)))
            return
        case 'all no boundary':
            // set to 'none' here b/c if null is used it doesn't pass the if(this.props.filter) check on map did update
            dispatch(set_map_filter('none'))
            return
        case 'ksi':
            dispatch(set_map_filter(ksiBoundary(filter.tileType, filter.id)))
            return
        default:
            dispatch(set_map_filter(ksiNoBoundary))
    }
}

// @TODO: polygon jawn
// sean set up the other API to have a 'poly' type so the sidebar part of polygons can be handled there.
// this jawn will hit a separate endpoint which gets the array of CRN's for map filtering
export const getPolygonCrashes = bbox => async dispatch => {
    console.log('hit the getPolygonCrashes reducer')
    
    // return b/c none of this is real, yet
    return

    const api = `www.supersickpolygonendpoint.gov.edu/polygon/${bbox}`

    const stream = await fetch(api, postOptions)

    // sidebar needs all the info, map just needs CRN so figure out a good way to serve both efficiently
    // one way would be for the back-end to return both in an object like so: {crashesForMap: [array of CRNS], crashesForSidebar: [full crash info]}
    // and then dispatch separately - one w/the CRN array for map.js and one with the full info for sidebar.js
        // that way map only listens for the array of CRN's in mapStatetoProps and sidebar only listens for the full array in mapStateToProps
    if(stream.ok) {
        const response = await stream.json()
        const crashesForMap = response.crashesForMap // just an array of CRN's to be passed as a mapbox filter
        const crashesForSidebar = response.crashesForSidebar // full array of crash info to populate the sidebar

        dispatch(get_polygon_crns(crashesForMap))
        dispatch(get_polygon_crashes(crashesForSidebar))
    }else {
        console.log('get crashes from polygon failed because ', stream)
    }
}
