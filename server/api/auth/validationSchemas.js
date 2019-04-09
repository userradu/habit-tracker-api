const Joi = require('joi');
const utils = require('../../utils/utils');

exports.signupSchema = Joi.object().keys({
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
    password: Joi.string().required().error(errors => utils.setErrorMessages(errors, [
        { 
            errType: "any.required", 
            message: "The password is required" 
        }
    ]))
});

exports.verifyAccountSchema = Joi.object().keys({
    verificationToken: Joi.string().required().error(errors => utils.setErrorMessages(errors, [
        { 
            errType: "any.required", 
            message: "The verification token is required" 
        },
        { 
            errType: "string.base", 
            message: "The verification token must be a string"
        }
    ]))
});