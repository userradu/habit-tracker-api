const config = require('./config/config');
const auth = require('./api/auth/routes');
const users = require('./api/user/userRoutes');
const express = require('express');
const app = express();

require('mongoose').connect(config.dbUrl, {useNewUrlParser: true});

// setup the app middlware
require('./middleware/appMiddleware')(app);

// setup the api
app.use('/auth', auth);
app.use('/users', users);

// export the app for testing
module.exports = app;