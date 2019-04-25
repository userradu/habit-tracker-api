const appRoot = require('app-root-path');
const config = require('../../../config/config');
const User = require('../../user/userModel');
const Joi = require('joi');
const { signupSchema, verifyAccountSchema } = require('./validationSchemas');
const HttpClientError = require('../../exceptions/httpClientError');
const utils = require('../../../utils/utils');

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
    var html = await utils.renderHTML(`${appRoot}/server/api/auth/signup/templates/verifyEmailTemplate.ejs`, {
        url: `${config.accountActivationEmail}?token=${token}`
    });

    return utils.sendEmail(email, 'Confirm account', html);
}


exports.signup = async function (req, res, next) {

    try {

        await Joi.validate(req.body, signupSchema, { abortEarly: false })
        
        const user = await User.findOne({ email: req.body.email })

        if (user) {
            throw new HttpClientError(409, "The email is taken");
        }

        const passwordHash = await utils.generateHash(req.body.password);
        const activationToken = await utils.generateToken();
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

exports.verifyAccount = async function (req, res, next) {
    try {
        await Joi.validate(req.body, verifyAccountSchema, { abortEarly: false });

        const verificationToken = req.body.verificationToken;
        const user = await User.findOne({ verificationToken: verificationToken });

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
