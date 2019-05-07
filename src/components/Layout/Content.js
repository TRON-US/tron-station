import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { setUpdatingContent } from 'ducks/app'
import { isEmpty } from 'lodash'

const mapStateToProps = (state, props) => ({
  isUpdatingContent: state.app.isUpdatingContent,
})

@connect(mapStateToProps)
class AppContent extends React.Component {
  static contextTypes = {
    getContentBuffer: PropTypes.func,
  }

  node: HTMLElement

  shouldComponentUpdate(nextProps: { isUpdatingContent: boolean }) {
    if (this.props.isUpdatingContent && !nextProps.isUpdatingContent) {
      return false
    }
    return true
  }

  componentDidUpdate() {
    const { isUpdatingContent, dispatch } = this.props
    if (isUpdatingContent) {
      dispatch(setUpdatingContent(false))
    }
  }

  render() {
    const { getContentBuffer } = this.context
    const { content } = getContentBuffer()
    return isEmpty(content) ? (
      <div className="utils__loadingPage" />
    ) : (
      <div className="utils__content">
        {content}
      </div>
    )
  }
}

export default AppContent
