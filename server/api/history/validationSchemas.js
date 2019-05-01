const Joi = require('joi');
const utils = require('../../utils/utils');

exports.historySchema = Joi.object().keys({
    date: Joi.date().required().iso().error(errors => utils.setErrorMessages(errors, [
        { 
            errType: "any.required", 
            message: "The date is required" 
        },
        { 
            errType: "date.base", 
            message: "The date is not valid" 
        },
        { 
            errType: "date.isoDate", 
            message: "ISO 8601 date format required" 
        }
    ]))
});