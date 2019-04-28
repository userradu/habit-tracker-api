const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('../config/winston');
const config = require('../config/config');

// setup global middleware here
module.exports = function(app) {

  if (config.env == 'development') {
    app.use(morgan('dev'));
  }
  
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors());
};
