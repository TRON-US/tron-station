import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { ConnectedRouter, routerMiddleware } from 'react-router-redux'
import { Helmet } from 'react-helmet'
import { composeWithDevTools } from 'redux-devtools-extension'
import createHistory from 'history/createBrowserHistory'
import thunk from 'redux-thunk'
import 'es6-promise/auto'
import 'setimmediate'
import 'chartist-plugin-tooltip'

// component
import Layout from 'components/Layout'
import { PROD_TITLE } from 'utils/constant.js'

// redux
import reducer from 'ducks'

// styles
import 'resources/_antd.less'
import 'resources/AntStyles/AntDesign/antd.cleanui.scss'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'resources/StationStyles/Core/core.station.scss'
import 'resources/StationStyles/Vendors/vendors.station.scss'

const history = createHistory()
const router = routerMiddleware(history)
const middlewares = [router, thunk]

// dev logger
const isLogger = false
if (isLogger && process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger')
  middlewares.push(logger)
}
const store = createStore(reducer, composeWithDevTools(applyMiddleware(...middlewares)))

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <Helmet titleTemplate={PROD_TITLE} />
        <Layout />
      </div>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)

export default history
