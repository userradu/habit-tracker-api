const bcrypt = require('bcrypt');
var User = require('../user/userModel');

const saltRounds = 10;

exports.signup = function (req, res, next) {
    bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
        const user = new User({
            email: req.body.email,
            password: hash
        });
    
        user.save((err, user) => {
            return res.status(201).json(user)
        })
    });
};
