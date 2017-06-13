import React from 'react';
import {render} from 'react-dom';
import Loading from './Loading.jsx';
import LoginForm from './LoginForm.jsx';
import Header from './Header.jsx';
import FileList from './FileList.jsx';
import DocPage from './DocPage.jsx';
import AccountService from './services/AccountService.jsx';

require('../styles/App.scss');

export default class App extends React.Component {
  constructor() {
    super();

    this.state = { isLoading: true };

    var path = window.location.pathname.substring(1); // Remove the first /
    this.state.selectedPage = path.substring(path.indexOf('/') + 1);
  }

  componentWillMount() {
    AccountService.init(user => this.setState({ isLoading: false, user }));
  }

  render() {
    if (this.state.isLoading) {
      return (<Loading />);
    }

    if (!this.state.user) {
      return (<LoginForm onLogin={user => this.setState({ user })} />);
    }

    return (
      <div className="main">
        <Header currentUser={this.state.user}  onLogoff={() => this.handleLogoff()} />
        <FileList selectedPage={this.state.selectedPage} onSelectFile={(path) => this.handleSelectFile(path)} />
        <DocPage selectedPage={this.state.selectedPage} />
      </div>
    );
  }

  handleLogoff() {
    AccountService.logoff();
    this.setState({ user: null });
  }

  handleSelectFile(path) {
    window.history.pushState(null, null, '/' + path);
    this.setState({ selectedPage: path });
  }
}

render((<App />), document.getElementById('app'));
