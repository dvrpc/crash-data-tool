import { createStore, applyMiddleware } from "redux";
import ReduxThunk from "redux-thunk";

import mapReducer from './reducers/mapReducer.js'

export default createStore(
    mapReducer,
    applyMiddleware(ReduxThunk)
)