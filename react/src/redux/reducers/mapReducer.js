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


/*****************************/
/****** ACTION CREATORS ******/
const get_data_from_keyword = data => ({ type: GET_DATA_FROM_KEYWORD, data })
const set_map_center = coords => ({ type: SET_MAP_CENTER, coords })


/***********************/
/****** REDUCERS ******/
export default function mapReducer(state = [], action) {
    switch(action.type){
        case GET_DATA_FROM_KEYWORD:
            return Object.assign({}, state, { data: action.data })
        case SET_MAP_CENTER:
            console.log('value passed as map center ', state)
            return Object.assign({}, state, { coords: action.coords })
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

export const setMapCenter = coords => dispatch => dispatch(set_map_center(coords))