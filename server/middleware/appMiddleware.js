const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('../config/winston');

// setup global middleware here
module.exports = function(app) {
  app.use(morgan('combined', { stream: winston.stream }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors());
};
