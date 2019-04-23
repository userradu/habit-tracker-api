const bcrypt = require('bcrypt');
const appRoot = require('app-root-path');
const config = require('../../../config/config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../user/userModel');
const Joi = require('joi');
const { signupSchema, verifyAccountSchema } = require('./validationSchemas');
const HttpClientError = require('../../exceptions/httpClientError');
const utils = require('../../../utils/utils');

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

async function sendAccountConfirmationEmail(email, token) {
    var transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        auth: {
            user: config.mail.username,
            pass: config.mail.password
        }
    });

    var html = await utils.renderHTML(`${appRoot}/server/api/auth/signup/templates/verifyEmailTemplate.ejs`, {
        url: `${config.accountActivationEmail}?token=${token}`
    });
    
    var mailOptions = {
        from: config.mail.username,
        to: email,
        subject: 'Confirm account',
        html: html
    };

    return transporter.sendMail(mailOptions);
}


exports.signup = async function (req, res, next) {

    try {

        await Joi.validate(req.body, signupSchema, { abortEarly: false })
        const user = await getUser({ email: req.body.email });

        if (user) {
            throw new HttpClientError(409, "The email is taken");
        }

        const passwordHash = await generatePasswordHash(req.body.password);
        const activationToken = await generateVerificationToken();
        await createAccount(req.body.email, passwordHash, activationToken);
        await sendAccountConfirmationEmail(req.body.email, activationToken);

        return res.status(201).json({
            status: 'success',
            message: 'Account created'
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

function getUser(query) {
    return User.findOne(query);
}

exports.verifyAccount = async function (req, res, next) {
    try {
        await Joi.validate(req.body, verifyAccountSchema, { abortEarly: false });

        const verificationToken = req.body.verificationToken;
        const user = await getUser({ verificationToken: verificationToken });

        if (!user) {
            throw new HttpClientError(404, "The account doesn't exists");
        }

        user.verified = true;
        user.verificationToken = null;
        await user.save();

        return res.json({
            status: 'success',
            message: 'Account verified'
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
