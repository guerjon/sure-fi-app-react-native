import { createStore, applyMiddleware } from 'redux'
import thunk from "redux-thunk";

import app from './reducers'


export default function configureStore(navReducer) {
  let store = createStore(app,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),applyMiddleware(thunk))
  return store
}

