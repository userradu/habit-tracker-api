var User = require('./userModel');

exports.get = function (req, res, next) {
    console.log('request headers', req.headers);
    
    User.find({})
        .exec()
        .then(function (users) {
            res.json(users);
        }, function (err) {
            next(err);
        });
};