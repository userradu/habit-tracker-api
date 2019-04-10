const bcrypt = require('bcrypt');
const config = require('../../config/config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../user/userModel');
const pug = require('pug');
const Joi = require('joi');
const { signupSchema, verifyAccountSchema } = require('./validationSchemas');
const HttpError = require('../exceptions/httpError');
const utils = require('../../utils/utils')

function generatePasswordHash(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

function generateVerificationToken() {
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

function createAccount(email, password, token) {
    const user = new User({
        email: email,
        password: password,
        verificationToken: token,
        verified: false
    });

    return user.save();
}

function sendAccountConfirmationEmail(email, token) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.mail.username,
            pass: config.mail.password
        }
    });

    var mailOptions = {
        from: config.mail.username,
        to: email,
        subject: 'Confirm account',
        html: pug.renderFile('server/api/auth/views/verifyEmailTemplate.pug', {
            url: `${config.accountActivationEmail}?token=${token}`
        })
    };

    return transporter.sendMail(mailOptions);
}


exports.signup = function (req, res, next) {
    let passwordHash;
    let activationToken;

    Joi.validate(req.body, signupSchema, { abortEarly: false })
        .then(() => {
            return getUser({ email: req.body.email });
        })
        .then((user) => {
            if (user) {
                throw new HttpError(409, "The email is taken");
            }
        })
        .then(() => {
            return generatePasswordHash(req.body.password);
        })
        .then((hash) => {
            passwordHash = hash;
            return generateVerificationToken();
        })
        .then((token) => {
            activationToken = token;
            return createAccount(req.body.email, passwordHash, token);
        })
        .then(() => {
            return sendAccountConfirmationEmail(req.body.email, activationToken);
        })
        .then(() => {
            return res.status(201).json({
                status: 'success',
                message: 'Account created'
            });
        })
        .catch((err) => {
            if (err.isJoi) {
                next(new HttpError(400, utils.getJoiErrorMessages(err)));
            }
            else {
                next(err);
            }
        });
};

function getUser(query) {
    return User.findOne(query);
}

exports.verifyAccount = function (req, res, next) {
    Joi.validate(req.body, verifyAccountSchema, { abortEarly: false })
        .then(() => {
            let verificationToken = req.body.verificationToken;

            return getUser({ verificationToken: verificationToken });
        })
        .then((user) => {
            if (!user) {
                throw new HttpError(404, "The account doesn't exists");
            }
            else {
                user.verified = true;
                user.verificationToken = null;
                return user.save();
            }
        })
        .then(() => {
            return res.json({
                status: 'success',
                message: 'Account verified'
            });
        })
        .catch((err) => {
            if (err.isJoi) {
                next(new HttpError(400, utils.getJoiErrorMessages(err)));
            }
            else {
                next(err);
            }
        });
};
