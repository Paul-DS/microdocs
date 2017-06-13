import axios from 'axios';

export default class DocService {
  static getFiles(callback) {
    return axios.get('/getFiles/').then(result => callback(result.data));
  }

  static getPage(path, callback) {
    return axios.get('/page/' + path).then(result => callback(result.data));
  }
}
