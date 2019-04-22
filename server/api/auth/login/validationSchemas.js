const Joi = require('joi');
const utils = require('../../../utils/utils');

exports.loginSchema = Joi.object().keys({
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