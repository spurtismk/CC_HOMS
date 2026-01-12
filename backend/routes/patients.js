const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/patients
// @desc    Get all patients
// @access  Private (Admin & Staff)
router.get('/', protect, async (req, res) => {
    try {
        const patients = await Patient.find({});
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/patients
// @desc    Register a patient
// @access  Private (Admin & Staff)
router.post('/', protect, async (req, res) => {
    try {
        const patient = new Patient(req.body);
        const createdPatient = await patient.save();
        res.status(201).json(createdPatient);
    } catch (error) {
        res.status(400).json({ message: 'Invalid patient data' });
    }
});

// @route   PUT /api/patients/:id
// @desc    Update patient details
// @access  Private (Admin & Staff)
router.put('/:id', protect, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            Object.assign(patient, req.body);
            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private/Admin (Critical Record Protection)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const result = await Patient.deleteOne({ _id: req.params.id });
        if (result.deletedCount > 0) {
            res.json({ message: 'Patient removed' });
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
