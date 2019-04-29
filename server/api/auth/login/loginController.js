const Joi = require('joi');
const HttpError = require('../../exceptions/httpError');
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

        if (!user) {
            throw new HttpError(404, "Invalid credentials");
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            throw new HttpError(404, "Invalid credentials");
        }

        const token = await createJWT({_id: user._id});

        return res.status(200).json({
            token: token
        });

    } catch (error) {
        next(error);
    }
}