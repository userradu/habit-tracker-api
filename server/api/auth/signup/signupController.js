const appRoot = require('app-root-path');
const config = require('../../../config/config');
const User = require('../../user/userModel');
const Joi = require('joi');
const { signupSchema, verifyAccountSchema } = require('./validationSchemas');
const HttpError = require('../../exceptions/httpError');
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
        url: `${config.accountActivationPageUrl}/${token}`
    });

    return utils.sendEmail(email, 'Confirm account', html);
}


exports.signup = async function (req, res, next) {

    try {

        await Joi.validate(req.body, signupSchema, { abortEarly: false });
        
        const user = await User.findOne({ email: req.body.email })

        if (user) {
            throw new HttpError(409, "The email is taken");
        }

        const passwordHash = await utils.generateHash(req.body.password);
        const activationToken = await utils.generateToken();
        await createAccount(req.body.email, passwordHash, activationToken);
        await sendAccountConfirmationEmail(req.body.email, activationToken);

        return res.status(201).json({
            message: 'Account created'
        });

    } catch (error) {
        next(error);
    }
};

exports.verifyAccount = async function (req, res, next) {
    try {
        await Joi.validate(req.body, verifyAccountSchema, { abortEarly: false });

        const verificationToken = req.body.verificationToken;
        const user = await User.findOne({ verificationToken: verificationToken });

        if (!user) {
            throw new HttpError(404, "The account doesn't exists");
        }

        user.verified = true;
        user.verificationToken = null;
        await user.save();

        return res.json({
            message: 'Account verified'
        });
    } catch (error) {
        next(error);
    }
};
