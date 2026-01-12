const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'In Use', 'Maintenance'],
        default: 'Available'
    },
    lastMaintenance: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
