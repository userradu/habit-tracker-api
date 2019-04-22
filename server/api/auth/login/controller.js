const Joi = require('joi');
const HttpClientError = require('../../exceptions/httpClientError');
const utils = require('../../../utils/utils');
const { loginSchema } = require('./validationSchemas');
const User = require('../../user/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../../config/config');

function createJWT(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, config.jwt_secret, { expiresIn: '1d' }, (err, token) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(token);
            }
        });
    });
}

exports.login = async function (req, res, next) {
    try {

        await Joi.validate(req.body, loginSchema, { abortEarly: false });

        const user = await User.findOne({ email: req.body.email });

        if (!user || await !bcrypt.compare(req.body.password, user.password)) {
            throw new HttpClientError(404, "Invalid credentials");
        }

        const token = await createJWT({_id: user._id});

        return res.status(200).json({
            status: 'success',
            data: {
                token: token
            }
        });

    } catch (error) {
        if (error.isJoi) {
            next(new HttpClientError(400, utils.getJoiErrorMessages(error)));
        }
        else {
            next(error);
        }
    }
}