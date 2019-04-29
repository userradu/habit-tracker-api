const mongoose = require('mongoose');
const async = require('async');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const config = require('../config/config');
const nodemailer = require('nodemailer');


exports.getJoiErrorMessages = function (err) {
    if (err.details.length == 1) {
        return err.details[0].message;
    }
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

exports.renderHTML = function(file, data) {
    return new Promise((resolve, reject) => {
        ejs.renderFile(file, data, function(err, str){
            if (err) {
                reject(err);
            }
            else {
                resolve(str);
            }
        });
    });
};

exports.generateToken = function() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(20, (err, buffer) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(buffer.toString('hex'));
            }
        });
    })
};

exports.generateHash = function (value, saltRounds = 10) {
    return bcrypt.hash(value, saltRounds);
};

exports.sendEmail = function(email, subject, content) {
    var transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        auth: {
            user: config.mail.username,
            pass: config.mail.password
        }
    });

    var mailOptions = {
        from: config.mail.username,
        to: email,
        subject: subject,
        html: content
    };

    return transporter.sendMail(mailOptions);
};