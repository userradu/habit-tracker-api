const Habit = require('./habitModel');
const Joi = require('joi');
const { habitSchema } = require('./validationSchemas');
const HttpError = require('../exceptions/httpError');

exports.getAllHabits = async function (req, res, next) {
    try {
        const habits = await Habit.find({ user: req.user._id }, 'name');
        return res.status(200).json({
            habits: habits
        });

    } catch (error) {
        next(error);
    }
};

exports.getHabit = async function (req, res, next) {
    try {
        const habit = await Habit.findOne({
            user: req.user._id,
            _id: req.params.id
        });

        if (!habit) {
            throw new HttpError(404, 'The habit does not exist');
        }

        return res.status(200).json({
            _id: habit.id,
            name: habit.name
        });
    } catch (error) {
        next(error);
    }
};

exports.createHabit = async function (req, res, next) {
    try {
        
        await Joi.validate(req.body, habitSchema, { abortEarly: false });

        const habit = new Habit({
            user: req.user._id,
            name: req.body.name
        });
        await habit.save();

        return res.status(201).json({
            _id: habit.id,
            name: habit.name
        });
    } catch (error) {
        next(error);
    }
};

exports.updateHabit = async function (req, res, next) {
    try {
        await Joi.validate(req.body, habitSchema, { abortEarly: false });

        const habit = await Habit.findOne({
            user: req.user._id,
            _id: req.params.id
        });

        if (!habit) {
            throw new HttpError(404, 'The habit does not exist');
        }

        habit.name = req.body.name;
        await habit.save();

        return res.status(200).json({
            _id: habit.id,
            name: habit.name
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteHabit = async function (req, res, next) {
    try {

        const result = await Habit.deleteOne({
            user: req.user._id,
            _id: req.params.id
        });

        if (result.deletedCount == 0) {
            throw new HttpError(404, 'The habit does not exist');
        }

        return res.status(200).json({
            message: "The habit was deleted"
        });

    } catch (error) {
        next(error);
    }
};