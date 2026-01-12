const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/staff
// @desc    Get all staff
// @access  Private/Admin
router.get('/', protect, async (req, res) => { // Staff can view staff too? "View user list" usually admin, but "Staff on duty" in dashboard.
    try {
        // Admin or Staff can view for dashboard
        const staff = await Staff.find({});
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/staff
// @desc    Create staff member
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const staff = new Staff(req.body);
        const createdStaff = await staff.save();
        res.status(201).json(createdStaff);
    } catch (error) {
        res.status(400).json({ message: 'Invalid staff data', error: error.message });
    }
});

// @route   PUT /api/staff/:id
// @desc    Update staff
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (staff) {
            Object.assign(staff, req.body);
            const updatedStaff = await staff.save();
            res.json(updatedStaff);
        } else {
            res.status(404).json({ message: 'Staff not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/staff/:id
// @desc    Delete staff
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const result = await Staff.deleteOne({ _id: req.params.id });
        if (result.deletedCount > 0) {
            res.json({ message: 'Staff removed' });
        } else {
            res.status(404).json({ message: 'Staff not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
