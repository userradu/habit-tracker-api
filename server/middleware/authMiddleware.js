const HttpClientError = require('../api/exceptions/httpClientError');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.verifyToken = function (req, res, next) {
    if (!req.headers.authorization) {
        next(new HttpClientError(401, 'The token is required'));
    }
    else {
        const token = req.headers.authorization.split(" ")[1];

        jwt.verify(token, config.jwt_secret, (err, decoded) => {
            if (err) {
                next(new HttpClientError(401, 'Invalid token'));
            }
            else {
                next();
            }
        });
    }
};