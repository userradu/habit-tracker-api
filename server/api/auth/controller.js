const bcrypt = require('bcrypt');
const config = require('../../config/config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../user/userModel');

const saltRounds = 10;

exports.signup = function (req, res, next) {
    bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
        crypto.randomBytes(20, (err, buffer) => {
            let verificationToken = buffer.toString('hex');

            const user = new User({
                email: req.body.email,
                password: hash,
                verificationToken: verificationToken,
                verified: false
            });

            user.save((err, user) => {
                
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: config.gmail.user,
                        pass: config.gmail.password
                    }
                });

                var mailOptions = {
                    from: config.gmail.user,
                    to: req.body.email,
                    subject: 'Confirm account',
                    html: '<p>some html</p>'
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(`An email was sent to ${req.body.email}`);
                        return res.status(201).json(user);
                    }
                });
            });
        });
    });
};

exports.verifyAccount = function(req, res, next) {
    let email = req.body.email;
    let verificationToken = req.body.verificationToken;
    User.findOne({email: email, verificationToken: verificationToken}, (err, user) => {
        if (user) {
            user.verified = true;
            user.verificationToken = null;
            user.save().then(() => {
                return res.json('account verified');
            })
        }
        else {
            return res.status(404).json("the account doesn't exists");
        }
    });
};