import { createAction, createReducer } from 'redux-act'
// import { push } from 'react-router-redux'
import { pendingTask, begin, end } from 'react-redux-spinner'

const REDUCER = 'app'
const NS = `@@${REDUCER}/`

const _setFrom = createAction(`${NS}SET_FROM`)
const _setLoading = createAction(`${NS}SET_LOADING`)

export const setUpdatingContent = createAction(`${NS}SET_UPDATING_CONTENT`)
export const setLayoutState = createAction(`${NS}SET_LAYOUT_STATE`)

export const setLoading = isLoading => {
  const action = _setLoading(isLoading)
  action[pendingTask] = isLoading ? begin : end
  return action
}

export const initLayout = () => (dispatch, getState) => {
  const state = getState()
  const location = state.routing.location
  const from = location.pathname + location.search
  dispatch(_setFrom(from))
  return Promise.reject() 
}

const initialState = {
  from: '',
  isUpdatingContent: false,
  isLoading: false,
  layoutState: {
    isMenuTop: true,
    menuMobileOpened: false,
    menuCollapsed: false,
    menuShadow: true,
    themeLight: false,
    squaredBorders: false,
    borderLess: true,
    fixedWidth: true
  }
}

export default createReducer(
  {
    [_setFrom]: (state, from) => ({ ...state, from }),
    [_setLoading]: (state, isLoading) => ({ ...state, isLoading }),
    [setUpdatingContent]: (state, isUpdatingContent) => ({ ...state, isUpdatingContent }),
    [setLayoutState]: (state, param) => {
      const layoutState = { ...state.layoutState, ...param }
      const newState = { ...state, layoutState }
      window.localStorage.setItem('app.layoutState', JSON.stringify(newState.layoutState))
      return newState
    }
  },
  initialState,
)
