import React from 'react';
import Loading from './Loading.jsx';
import DocService from './services/DocService.jsx';

require('../styles/DocPage.scss');

export default class DocPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true };

    DocService.getPage(this.props.selectedPage, page => {
      this.setState({ isLoading: false, pageContent: page });
    });
  }

  render () {
    return (
      <div id="doc-page">
        {this.renderContent()}
      </div>
    );
  }

  renderContent() {
    if (this.state.isLoading) {
      return (<Loading />);
    }

    if (this.state.pageContent == null) {
      return(<div className="not-found">Not found</div>)
    }

    return (<div className="content" dangerouslySetInnerHTML={{__html: this.state.pageContent}}></div>);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedPage != nextProps.selectedPage || (!this.state.pageContent && nextProps.selectedPage)) {
      this.setState({ isLoading: true });
      DocService.getPage(nextProps.selectedPage, page => {
        this.setState({ isLoading: false, pageContent: page });
      });
    }
  }
}
