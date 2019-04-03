var _ = require('lodash');

var config = {
  dev: 'development',
  port: process.env.PORT || 3000
};

process.env.NODE_ENV = process.env.NODE_ENV || config.dev;
config.env = process.env.NODE_ENV;

var envConfig = require('./' + config.env);

module.exports = _.merge(config, envConfig);
