const User = require('./userModel');
const Joi = require('joi');
const { checkEmailNotTakenSchema } = require('./validationSchemas');

exports.checkEmailNotTaken = async function (req, res, next) {
    try {

        await Joi.validate(req.body, checkEmailNotTakenSchema, { abortEarly: false });

        const user = await User.findOne({email: req.body.email});

        return res.status(200).json({
            emailTaken: user != null
        });

    } catch (error) {
        next(error);
    }
};