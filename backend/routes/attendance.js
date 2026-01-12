const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/attendance
// @desc    Get attendance logs
// @access  Private (Admin & Staff)
router.get('/', protect, async (req, res) => {
    try {
        const attendance = await Attendance.find({}).populate('staffId', 'name designation');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/attendance
// @desc    Log attendance
// @access  Private (Admin & Staff)
router.post('/', protect, async (req, res) => {
    try {
        const attendance = new Attendance(req.body);
        const createdAttendance = await attendance.save();
        res.status(201).json(createdAttendance);
    } catch (error) {
        // Check for duplicate key error (MongoDB code 11000)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Attendance already logged for this shift' });
        }
        res.status(400).json({ message: 'Invalid data' });
    }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance/shift
// @access  Private (Admin & Staff)
router.put('/:id', protect, async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (attendance) {
            Object.assign(attendance, req.body);
            const updatedAttendance = await attendance.save();
            res.json(updatedAttendance);
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance log
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const result = await Attendance.deleteOne({ _id: req.params.id });
        if (result.deletedCount > 0) {
            res.json({ message: 'Record removed' });
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
