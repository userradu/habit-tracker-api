const Joi = require('joi');
const HttpClientError = require('../../exceptions/httpClientError');
const utils = require('../../../utils/utils');
const { sendResetPasswordEmailSchema, resetPasswordSchema } = require('./validationSchemas');
const User = require('../../user/userModel');
const bcrypt = require('bcrypt');
const config = require('../../../config/config');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const appRoot = require('app-root-path');

function generateToken() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(20, (err, buffer) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(buffer.toString('hex'));
            }
        });
    })
}

function generateHash(token) {
    const saltRounds = 10;
    return bcrypt.hash(token, saltRounds);
}

async function sendEmail(email, token) {
    var transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        auth: {
            user: config.mail.username,
            pass: config.mail.password
        }
    });

    const path = `${appRoot}/server/api/auth/forgotPassword/templates/forgotPasswordEmailTemplate.ejs`;
    var html = await utils.renderHTML(path, {
        url: `${config.forgotPasswordEmailUrl}?email=${email}&token=${token}`
    });

    var mailOptions = {
        from: config.mail.username,
        to: email,
        subject: 'Forgot password',
        html: html
    };

    return transporter.sendMail(mailOptions);
}

exports.sendResetPasswordEmail = async function (req, res, next) {
    try {

        await Joi.validate(req.body, sendResetPasswordEmailSchema, { abortEarly: false });

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            throw new HttpClientError(404, "The account doesn't exists");
        }

        const token = await generateToken();
        user.resetPasswordToken = await generateHash(token);
        user.resetPasswordExpires = Date.now() + (60 * 60 * 1000); //1h
        await user.save();

        await sendEmail(req.body.email, token);

        return res.status(200).json({
            status: 'success',
            message: 'Email sent'
        });


    } catch (error) {
        if (error.isJoi) {
            next(new HttpClientError(400, utils.getJoiErrorMessages(error)));
        }
        else {
            next(error);
        }
    }
};

exports.resetPassword = async function (req, res, next) {
    try {

        await Joi.validate(req.body, resetPasswordSchema, { abortEarly: false });

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            throw new HttpClientError(404, "Invalid data provided");
        }

        const tokensMatch = await bcrypt.compare(req.body.token, user.resetPasswordToken);

        if (!tokensMatch) {
            throw new HttpClientError(404, "Invalid data provided");
        }

        if (user.resetPasswordExpires < Date.now()) {
            throw new HttpClientError(403, "The token is expired");
        }

        const passwordHash = await generateHash(req.body.password);

        user.password = passwordHash;
        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'Password modified'
        });

    } catch (error) {
        if (error.isJoi) {
            next(new HttpClientError(400, utils.getJoiErrorMessages(error)));
        }
        else {
            next(error);
        }
    }
};