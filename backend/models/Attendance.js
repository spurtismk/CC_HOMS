const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    shift: {
        type: String,
        enum: ['Morning', 'Evening', 'Night'],
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave'],
        required: true
    }
}, { timestamps: true });

// Prevent duplicate attendance for same staff, date, and shift
attendanceSchema.index({ staffId: 1, date: 1, shift: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
