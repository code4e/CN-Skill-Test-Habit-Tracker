const mongoose = require('mongoose');


const habitSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    // status:{
    //     type: String,
    //     default: 'None'
    // },
    start: {
        type: Date,
        required: true
    },
    end:{
        type: Date,
        required: true
    },
    dates: [{
        date: {
            type: Date
        },
        status: {
            type: String,
            default: 'None'
        }
    }]
    // end: {
    //     type: Date,
    //     required: true
    // },
    // currentRunningStreak: {
    //     type: Number,
    //     default: 0
    // },
    // bestStreak: {
    //     type: Number,
    //     default: 0
    // },
}, {
    timestamps: true
});


const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;