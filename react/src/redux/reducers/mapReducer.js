// Miscellaneous
const getOptions = {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
}


/**********************/
/****** ACTIONS ******/
const GET_DATA_FROM_KEYWORD = 'GET_DATA_FROM_KEYWORD'
const SET_MAP_CENTER = 'SET_MAP_CENTER'
const SET_MAP_BOUNDING = 'SET_MAP_BOUNDING'


/*****************************/
/****** ACTION CREATORS ******/
const get_data_from_keyword = data => ({ type: GET_DATA_FROM_KEYWORD, data })
const set_map_center = center => ({ type: SET_MAP_CENTER, center })
const set_map_bounding = bounding => ({ type: SET_MAP_BOUNDING, bounding })


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

    // error handling - pass the failure message + the boundary object to give context to the displayed error response
    if(!stream.ok) {
        const failObj = { fail: stream.statusText, boundaryObj }
        dispatch(get_data_from_keyword(failObj))
    }else{
        const response = await stream.json()    
        dispatch(get_data_from_keyword(response))
    }
}

// @TODO: probably going to have to rename this & create a second function that *just* spits back co-ords (for when users update map center by moving the map around instead of searching)
export const setMapCenter = center => dispatch => {
    center.then(response => {
        const center = response.features[0].center
        dispatch(set_map_center(center))
    })
}

export const setMapBounding = bounding => dispatch => {
    bounding.name = decodeURIComponent(bounding.name)
    dispatch(set_map_bounding(bounding))
}