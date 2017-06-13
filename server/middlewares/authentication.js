var passport = require("passport");
var jwt = require('passport-jwt');
var ExtractJwt = jwt.ExtractJwt;
var Strategy = jwt.Strategy;
var config = require('../config.json');
var database = require('../database');

var params = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: config.tokenKey
};

module.exports.checkTokenData = (tokenData, callback) => {
  if (new Date(tokenData.expire).getTime() < new Date().getTime()) {
    return callback(null, false);
  }

  database.findUser(tokenData.id).catch(error => callback(error, false)).then(user => {
    return callback(null, user);
  });
}

var strategy = new Strategy(params, module.exports.checkTokenData);

passport.use(strategy);

module.exports.initialize = () => passport.initialize();
module.exports.authenticate = () => passport.authenticate("jwt", { session: false });
