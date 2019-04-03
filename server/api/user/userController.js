var User = require('./userModel');

exports.get = function (req, res, next) {
    User.find({})
        .exec()
        .then(function (users) {
            res.json(users);
        }, function (err) {
            next(err);
        });
};