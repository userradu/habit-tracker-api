var express = require('express');
var app = express();

// setup the app middlware
require('./middleware/appMiddleware')(app);

// export the app for testing
module.exports = app;