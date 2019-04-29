const HttpClientError = require('../api/exceptions/httpClientError');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../api/user/userModel');

function verifyJwtToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.jwt_secret, (err, decoded) => {
            if (err) {
                reject(new HttpClientError(401, 'Invalid token'));
            }
            else {
                resolve(decoded);
            }
        });
    });
}

exports.requireAuthentication = async function (req, res, next) {
    try {
        if (!req.headers.authorization) {
            throw new HttpClientError(401, 'The token is required');
        }

        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = await verifyJwtToken(token);
        const user = await User.findById(decodedToken._id, 'email');
        req.user = user;
        next();

    } catch (error) {
        next(error);
    }
};