const config = require('./config/config');
const api = require('./api/api')
const errorMiddleware = require('./middleware/errorMiddleware');
const express = require('express');
const app = express();

require('mongoose').connect(config.dbUrl, {useNewUrlParser: true});

// setup the app middlware
require('./middleware/appMiddleware')(app);

// setup the api
app.use('/api', api);

app.use(errorMiddleware.errorHandler);

// export the app for testing
module.exports = app;