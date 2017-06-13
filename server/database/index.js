var config = require('../config.json');

if (config.database.type == 'embedded') {
  module.exports = require('./embedded');
}
else {
  throw Exception("Database type \"" + config.database.type + "\" not managed");
}
