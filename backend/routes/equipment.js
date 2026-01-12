const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/equipment
// @desc    Get equipment list
// @access  Private (Admin & Staffs)
router.get('/', protect, async (req, res) => {
    try {
        const equipment = await Equipment.find({});
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/equipment
// @desc    Add equipment
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const equipment = new Equipment(req.body);
        const createdEquipment = await equipment.save();
        res.status(201).json(createdEquipment);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
});

// @route   PUT /api/equipment/:id
// @desc    Update equipment status
// @access  Private (Admin & Staff - for status updates)
router.put('/:id', protect, async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (equipment) {
            Object.assign(equipment, req.body);
            const updatedEquipment = await equipment.save();
            res.json(updatedEquipment);
        } else {
            res.status(404).json({ message: 'Equipment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/equipment/:id
// @desc    Remove equipment
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const result = await Equipment.deleteOne({ _id: req.params.id });
        if (result.deletedCount > 0) {
            res.json({ message: 'Equipment removed' });
        } else {
            res.status(404).json({ message: 'Equipment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
