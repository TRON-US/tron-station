import React from 'react'
import Page from 'components/Layout/Page'
import Helmet from 'react-helmet'
import EnergyCalcForm from 'components/EnergyCalculator'

class EnergyCalculatorPage extends React.Component {
  static defaultProps = {
    pathName: 'Energy Calculator',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Energy Calculator Page" />
        <EnergyCalcForm/>
      </Page>
    )
  }
}

export default EnergyCalculatorPage
