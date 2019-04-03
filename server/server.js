var config = require('./config/config');
var api = require('./api/api');
var express = require('express');
var app = express();

require('mongoose').connect(config.db.url, {useNewUrlParser: true});

// setup the app middlware
require('./middleware/appMiddleware')(app);

// setup the api
app.use('/api', api);

// export the app for testing
module.exports = app;