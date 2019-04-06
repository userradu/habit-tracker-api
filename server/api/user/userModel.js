var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    verified: {
        type: Boolean
    },

    verificationToken: {
        type: String
    }
});

module.exports = mongoose.model('user', UserSchema);
