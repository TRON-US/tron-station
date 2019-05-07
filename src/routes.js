import React from 'react'
import { Route } from 'react-router-dom'
import { ConnectedSwitch } from 'reactRouterConnected'
import Loadable from 'react-loadable'
import Page from 'components/Layout/Page'
import NotFoundPage from 'pages/NotFoundPage'
import HomePage from 'pages/DashboardPage'

// route loader
const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null,
  })

const loadableRoutes = {
  '/': {
    component: loadable(() => import('pages/DashboardPage')),
  },'/calculator': {
    component: loadable(() => import('pages/EnergyCalculatorPage')),
  },'/votereward': {
    component: loadable(() => import('pages/VoteRewardPage')),
  }
}

class Routes extends React.Component {
  timeoutId = null

  componentDidMount() {
    this.timeoutId = setTimeout(
      () => Object.keys(loadableRoutes).forEach(path => loadableRoutes[path].component.preload()),
      5000,
    )
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  render() {
    return (
      <ConnectedSwitch>
        {/* default page */}
        <Route exact path="/" component={HomePage} />
        {Object.keys(loadableRoutes).map(path => {
          const { exact, ...props } = loadableRoutes[path]
          props.exact = exact === void 0 || exact || false
          return <Route key={path} path={path} {...props} />
        })}
        <Route
          render={() => (
            <Page>
              <NotFoundPage />
            </Page>
          )}
        />
      </ConnectedSwitch>
    )
  }
}

export { loadableRoutes }
export default Routes
