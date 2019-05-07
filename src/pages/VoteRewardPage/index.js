import React from 'react'
import Page from 'components/Layout/Page'
import Helmet from 'react-helmet'
import SRVoteForm from 'components/VoteReward'

class VoteRewardPage extends React.Component {
  static defaultProps = {
    pathName: 'Vote Reward',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Vote Reward" />
        <SRVoteForm/>
      </Page>
    )
  }
}

export default VoteRewardPage
