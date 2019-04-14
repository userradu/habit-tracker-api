var _ = require('lodash');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
  port: process.env.PORT || 3000,
  mail: {
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD
  },
  accountActivationEmail: 'www.google.com'
};

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
config.env = process.env.NODE_ENV;

const envConfig = require(`./${config.env}`);

module.exports = _.merge(config, envConfig);