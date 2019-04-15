const mongoose = require('mongoose');
const async = require('async');

exports.getJoiErrorMessages = function (err) {
    return err.details.map(err => err.message);
};

exports.setErrorMessages = function (errors, errorMessages) {
    let errorTypes = errorMessages.map(err => err.errType);

    errors.forEach(err => {
        let index = errorTypes.indexOf(err.type);
        if (index != -1) {
            err.message = errorMessages[index].message;
        }
    });

    return errors;
};

exports.clearDatabase = function (callback) {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('Attempt to clear non testing database!');
    }

    const fns = [];

    function createAsyncFn(collection) {
        fns.push((done) => {
            mongoose.connection.collections[collection].deleteMany({}, (err) => {
                if (err) {
                    throw new Error(`An error occured while deleting the ${collection} collection`);
                }
                else {
                    done();
                }
            });
        });
    }

    for (const collection in mongoose.connection.collections) {
        if (mongoose.connection.collections.hasOwnProperty(collection)) {
            createAsyncFn(collection);
        }
    }

    async.parallel(fns, () => callback());
};