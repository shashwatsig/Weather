const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    temperature: {
        type: Number
    },
    condition: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Search', searchSchema);
