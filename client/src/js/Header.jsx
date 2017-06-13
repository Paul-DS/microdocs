import React from 'react';

require('../styles/Header.scss');

export default class Header extends React.Component {
  render () {
    return (
      <div id="header-bar">
        <div className="site-content">
          <div className="site-logo"></div>
          <div className="logoff" onClick={() => this.props.onLogoff()}>Log off</div>
        </div>
      </div>
    );
  }
}
