const Joi = require('joi');
const utils = require('../../utils/utils');

exports.habitSchema = Joi.object().keys({
    name: Joi.string().required().error(errors => utils.setErrorMessages(errors, [
        { 
            errType: "any.required", 
            message: "The habit name is required" 
        }
    ]))
});