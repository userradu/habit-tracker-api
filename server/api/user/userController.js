const User = require('./userModel');
const Joi = require('joi');
const { checkEmailExistsSchema } = require('./validationSchemas');

exports.checkEmailExists = async function (req, res, next) {
    try {

        await Joi.validate(req.body, checkEmailExistsSchema, { abortEarly: false });

        const user = await User.findOne({email: req.body.email});

        return res.status(200).json({
            emailExists: user != null
        });

    } catch (error) {
        next(error);
    }
};