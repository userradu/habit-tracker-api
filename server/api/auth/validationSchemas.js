const Joi = require('joi');

exports.signupSchema = Joi.object().keys({
    email: Joi.string().email().required().error(errors => {
        errors.forEach(err => {
            switch (err.type) {
                case "any.required":
                    err.message = "The email is required";
                    break;
                case "string.email":
                    err.message = "The email is not valid";
                    break;
                default:
                    break;
            }
        });
        return errors
    }),
    password: Joi.string().required().error(errors => {
        errors.forEach(err => {
            switch (err.type) {
                case "any.required":
                    err.message = "The password is required";
                    break;
                default:
                    break;
            }
        });
        return errors
    })
});

