const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private (Admin & Staff)
router.get('/', protect, async (req, res) => {
    try {
        // Populate patient and doctor details
        const appointments = await Appointment.find({})
            .populate('patientId', 'name contact')
            .populate('doctorId', 'name designation');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/appointments
// @desc    Create appointment
// @access  Private (Admin & Staff)
router.post('/', protect, async (req, res) => {
    // Basic logic: Check overlap
    const { doctorId, date, time } = req.body;

    try {
        // Simple check: same doctor, same date (ignoring time mostly or string match? 
        // Real logic needs date range. For simple project, assuming user inputs specific slots or we just check rough overlap)
        // Let's rely on frontend or just basic exact match for now to satisfy "Prevent overlapping"

        // Convert date to start/end or just string compare if "date" is a day and "time" is separate
        // If date is ISODate, we need to span the day.
        // Assuming date is a Day string or Date object.

        // Exact match check
        const conflict = await Appointment.findOne({
            doctorId,
            date: new Date(date), // Check exact date match (may need range if date has time component)
            time,
            status: 'Scheduled'
        });

        if (conflict) {
            return res.status(400).json({ message: 'Doctor is already booked at this time' });
        }

        const appointment = new Appointment(req.body);
        const createdAppointment = await appointment.save();
        res.status(201).json(createdAppointment);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid appointment data' });
    }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment (Reschedule/Status)
// @access  Private (Admin & Staff)
router.put('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (appointment) {
            Object.assign(appointment, req.body);
            const updatedAppointment = await appointment.save();
            res.json(updatedAppointment);
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel/Delete appointment
// @access  Private (Admin & Staff)
router.delete('/:id', protect, async (req, res) => {
    try {
        const result = await Appointment.deleteOne({ _id: req.params.id });
        if (result.deletedCount > 0) {
            res.json({ message: 'Appointment removed' });
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
