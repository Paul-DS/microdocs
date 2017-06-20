import axios from 'axios';

export default class AccountService {
  static init(callback) {
    var cookie = document.cookie
      .split(';')
      .map(c => c.split('=').map(value => value.trim()))
      .filter(c => c[0] == 'token');

    AccountService.token = cookie.length > 0 ? cookie[0][1] : null;

    if (AccountService.token) {
      axios.defaults.headers.common['Authorization'] = 'JWT ' + AccountService.token;
    }

    axios.get('/userInfo').then(result => callback(result.data)).catch(() => callback(null));
  }

  static login(username, password, callback) {
    return axios.post('/login', { username, password }).then(result => {
      if (result.data.error || !result.data.token) {
        callback(null);
      }
      else {
        var d = new Date();
        d.setMonth(d.getMonth() + 3);
        document.cookie = 'token=' + result.data.token + ";expires=" + d.toUTCString() + ";path=/";
        AccountService.token = result.data.token;
        axios.defaults.headers.common['Authorization'] = 'JWT ' + AccountService.token;

        return axios.get('/userInfo').then(result => callback(result.data));
      }
    }).catch(() => callback(null));
  }

  static logoff() {
    var d = new Date();
    d.setMonth(d.getMonth() + 3);
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
    delete AccountService.token;
    axios.defaults.headers.common['Authorization'] = null;
  }
}
