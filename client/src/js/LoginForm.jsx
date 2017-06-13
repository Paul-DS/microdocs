import React from 'react';
import Loading from './Loading.jsx';
import AccountService from './services/AccountService.jsx';

require('../styles/LoginForm.scss');

export default class LoginForm extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render () {
    if (this.state.isLoading) {
      return (<div id="login"><Loading /></div>);
    }

    return (
      <div id="login">
        <div className="site-logo"></div>
        <div className="title">Log in</div>
        <form>
          <input type="text" name="username" placeholder="Username" onChange={(e) => this.handleUsernameChange(e)}  />
          <input type="password" name="password" placeholder="Password" onChange={(e) => this.handlePasswordChange(e)}  />
          <button onClick={(e) => this.handleClickLogin(e)}>Log in</button>
        </form>
      </div>
    );
  }

  handleUsernameChange(e) {
    this.setState({ username: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  handleClickLogin(e) {
    e.preventDefault();

    this.setState({ isLoading: true });

    AccountService.login(this.state.username, this.state.password, user => {
      this.setState({ isLoading: false });
      if (user) {
        this.props.onLogin(user);
      }
    });
  }
}
