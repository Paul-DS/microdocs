var config = require('../config.json');

if (!config.authentication) {
  return null;
}
else if (config.authentication.type == 'embedded') {
  module.exports = require('./embedded');
}
else {
  throw Exception("Authentication type \"" + config.authentication.type + "\" not managed");
}
