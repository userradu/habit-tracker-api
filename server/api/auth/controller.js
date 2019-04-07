const bcrypt = require('bcrypt');
const config = require('../../config/config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../user/userModel');
const pug = require('pug');
const Joi = require('joi');
const { signupSchema } = require('./validationSchemas');
const HttpError = require('../exceptions/httpError');
const utils = require('../../utils/utils')

const saltRounds = 10;

exports.signup = function (req, res, next) {

    Joi.validate(req.body, signupSchema, { abortEarly: false }, (err, value) => {
        if (err) return next(new HttpError(400, utils.getJoiErrorMessages(err)));

        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            if (err) return next(err);

            crypto.randomBytes(20, (err, buffer) => {
                if (err) return next(err);

                let verificationToken = buffer.toString('hex');

                const user = new User({
                    email: req.body.email,
                    password: hash,
                    verificationToken: verificationToken,
                    verified: false
                });

                user.save((err, user) => {

                    if (err) return next(err);

                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: config.mail.username,
                            pass: config.mail.password
                        }
                    });

                    var mailOptions = {
                        from: config.mail.username,
                        to: req.body.email,
                        subject: 'Confirm account',
                        html: pug.renderFile('server/api/auth/views/verifyEmailTemplate.pug', {
                            url: config.accountActivationEmail
                        })
                    };

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) return next(err);

                        console.log(`An email was sent to ${req.body.email}`);
                        return res.status(201).json({
                            status: 'success',
                            message: 'Account created'
                        });
                    });
                });
            });
        });
    })
};

exports.verifyAccount = function (req, res, next) {
    let email = req.body.email;
    let verificationToken = req.body.verificationToken;
    User.findOne({ email: email, verificationToken: verificationToken }, (err, user) => {
        if (err) return next(err);

        if (!user) return next(new HttpError(404, "The account doesn't exists"));

        user.verified = true;
        user.verificationToken = null;
        user.save((err, user) => {
            if (err) return next(err);

            return res.json({
                status: 'success',
                message: 'Account verified'
            });
        })
    });
};
