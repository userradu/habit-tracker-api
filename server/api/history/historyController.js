const History = require('./historyModel');
const Joi = require('joi');
const HttpError = require('../exceptions/httpError');
const { historySchema } = require('./validationSchemas');

exports.getHistory = async function (req, res, next) {
    try {

        const history = await History.find({ habit: req.params.habitId }, 'date');
        return res.status(200).json({
            history: history
        })

    } catch (error) {
        next(error);
    }
};

exports.addDay = async function (req, res, next) {
    try {

        await Joi.validate(req.body, historySchema, { abortEarly: false });

        const history = new History({
            habit: req.params.habitId,
            date: req.body.date
        });

        await history.save();

        return res.status(201).json({
            _id: history.id,
            date: history.date
        });

    } catch (error) {
        next(error);
    }
};

exports.removeDay = async function (req, res, next) {
    try {

        await Joi.validate(req.body, historySchema, { abortEarly: false });

        const result = await History.deleteOne({
            date: req.body.date,
            habit: req.params.habitId
        });

        if (result.deletedCount == 0) {
            throw new HttpError(404, 'The specified date does not exist');
        }

        return res.status(200).json({
            message: "The date was removed"
        });

    } catch (error) {
        next(error);
    }
};