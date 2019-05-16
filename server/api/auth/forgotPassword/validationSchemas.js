const Joi = require('joi');
const utils = require('../../../utils/utils');

exports.sendResetPasswordEmailSchema = Joi.object().keys({
    email: Joi.string().email().required().error(errors => utils.setErrorMessages(errors, [
        { 
            errType: "any.required", 
            message: "The email is required" 
        },
        { 
            errType: "string.email", 
            message: "The email is not valid" 
        }
    ]))
});

exports.resetPasswordSchema = Joi.object().keys({
    email: Joi.string().email().required().error(errors => utils.setErrorMessages(errors, [
        { 
            errType: "any.required", 
            message: "The email is required" 
        },
        { 
            errType: "string.email", 
            message: "The email is not valid" 
        }
    ])),

    token: Joi.string().required().error(errors => utils.setErrorMessages(errors, [
        { 
            errType: "any.required", 
            message: "The token is required" 
        }
    ])),

    password: Joi.string().required().error(errors => utils.setErrorMessages(errors, [
        { 
            errType: "any.required", 
            message: "The password is required" 
        }
    ])),

    confirmPassword: Joi.any().valid(Joi.ref('password')).required().error(errors => utils.setErrorMessages(errors, [
        {
            errType: "any.required",
            message: "The confirm password field is required"
        },
        {
            errType: "any.allowOnly",
            message: "Password and confirm password do not match"
        }
    ]))
});