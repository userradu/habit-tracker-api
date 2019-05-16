const Joi = require('joi');
const HttpError = require('../../exceptions/httpError');
const utils = require('../../../utils/utils');
const { sendResetPasswordEmailSchema, resetPasswordSchema } = require('./validationSchemas');
const User = require('../../user/userModel');
const bcrypt = require('bcrypt');
const config = require('../../../config/config');
const appRoot = require('app-root-path');

async function sendEmail(email, token) {
    const path = `${appRoot}/server/api/auth/forgotPassword/templates/forgotPasswordEmailTemplate.ejs`;
    var html = await utils.renderHTML(path, {
        url: `${config.resetPasswordUrl}?email=${email}&token=${token}`
    });

    return utils.sendEmail(email, 'Forgot password', html);
}

exports.sendResetPasswordEmail = async function (req, res, next) {
    try {

        await Joi.validate(req.body, sendResetPasswordEmailSchema, { abortEarly: false });

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            throw new HttpError(404, "The account doesn't exists");
        }

        const token = await utils.generateToken();
        user.resetPasswordToken = await utils.generateHash(token);
        user.resetPasswordExpires = Date.now() + (60 * 60 * 1000); //1h
        await user.save();

        await sendEmail(req.body.email, token);

        return res.status(200).json({
            message: 'Email sent'
        });


    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async function (req, res, next) {
    try {

        await Joi.validate(req.body, resetPasswordSchema, { abortEarly: false });

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            throw new HttpError(404, "Invalid data provided");
        }

        const tokensMatch = await bcrypt.compare(req.body.token, user.resetPasswordToken);

        if (!tokensMatch) {
            throw new HttpError(404, "Invalid data provided");
        }

        if (user.resetPasswordExpires < Date.now()) {
            throw new HttpError(403, "The token is expired");
        }

        const passwordHash = await utils.generateHash(req.body.password);

        user.password = passwordHash;
        await user.save();

        return res.status(200).json({
            message: 'Password modified'
        });
    
    } catch (error) {
        next(error);
    }
};