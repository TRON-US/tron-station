import React from 'react'
import Page from 'components/Layout/Page'
import Helmet from 'react-helmet'
import DashboardForm from 'components/Dashboard'

class DashboardPage extends React.Component {
  static defaultProps = {
    pathName: 'Dashboard',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Dashboard" />
        <DashboardForm />
      </Page>
    )
  }
}

export default DashboardPage
