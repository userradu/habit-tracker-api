const Joi = require('joi');
const utils = require('../../utils/utils');

exports.checkEmailExistsSchema = Joi.object().keys({
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
});