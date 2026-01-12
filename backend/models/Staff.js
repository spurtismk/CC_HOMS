const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        enum: ['Doctor', 'Nurse', 'Reception', 'Admin', 'Other'],
        required: true
    },
    department: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    email: { // Optional, unique identifier for operational purposes if needed
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
