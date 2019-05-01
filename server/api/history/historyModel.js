const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    habit: {
        type: Schema.Types.ObjectId,
        ref: 'Habit'
    }
});

module.exports = mongoose.model('history', historySchema);
