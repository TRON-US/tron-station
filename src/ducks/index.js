import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { pendingTasksReducer } from 'react-redux-spinner'
import app from './app'

// combine reducers
export default combineReducers({
  routing: routerReducer,
  pendingTasks: pendingTasksReducer,
  app
})
