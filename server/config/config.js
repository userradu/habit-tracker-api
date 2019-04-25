var _ = require('lodash');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
  port: process.env.PORT || 3000,
  accountActivationEmail: 'www.google.com',
  forgotPasswordEmailUrl: 'www.google.com',
  jwt_secret: process.env.JWT_SECRET
};

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
config.env = process.env.NODE_ENV;

const envConfig = require(`./${config.env}`);

module.exports = _.merge(config, envConfig);