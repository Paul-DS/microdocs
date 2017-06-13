/**
 * This module manage the authentication for embedded database.
 * @module authentication/embedded
 */

var crypto = require('crypto');
var sqlite3 = require('sqlite3');
var uuidV4 = require('uuid/v4');
var config = require('../config.json');

var connect = () => new sqlite3.Database('./db.sqlite');

module.exports.create = (username, password) => {
  var db = connect();

  return new Promise((resolve, reject) => {
    db.run("CREATE TABLE users (id TEXT, username TEXT, password TEXT)", error => {
      if (error) {
        return reject(error);
      }

      db.run("INSERT INTO users VALUES(?, ?, ?)", uuidV4(), username, crypto.createHash('sha256').update(password).digest('base64'), error => {
        db.close();

        if (error) reject(error);
        else resolve();
      });
    });
  });
};

/**
 * Check if the specified credientials are valid.
 */
module.exports.login = (username, password) => {
  var db = connect();

  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM users WHERE username = ? AND password = ?", username, crypto.createHash('sha256').update(password).digest('base64'), (error, row) => {
      db.close();

      if (error) reject(error);
      else resolve(row ? row.id : null);
    });
  });
};

/**
 * Find the user maching with the specified credientials.
 */
module.exports.findUser = (id) => {
  var db = connect();

  return new Promise((resolve, reject) => {
    db.get("SELECT id, username FROM users WHERE id = ?", id, (error, row) => {
      db.close();

      if (error) reject(error);
      else resolve(row);
    });
  });
};
