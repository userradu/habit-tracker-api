var _ = require('lodash');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
  port: process.env.PORT || 3000,
  accountActivationPageUrl: process.env.ACCOUNT_ACTIVATION_PAGE_URL,
  resetPasswordUrl: process.env.RESET_PASSWORD_PAGE_URL,
  jwt_secret: process.env.JWT_SECRET
};

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
config.env = process.env.NODE_ENV;

const envConfig = require(`./${config.env}`);

module.exports = _.merge(config, envConfig);