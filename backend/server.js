const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const connectDB = require('./db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using https
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Route Files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const staffRoutes = require('./routes/staff');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const attendanceRoutes = require('./routes/attendance');
const equipmentRoutes = require('./routes/equipment');
// const dashboardRoutes = require('./routes/dashboard'); // Will implement logic in a simple route or separate file

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/equipment', equipmentRoutes);

// Dashboard Stats Route (Simple, so keeping here or moving later if complex)
app.get('/api/dashboard/stats', async (req, res) => {
    // Basic protection
    if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const Appointment = require('./models/Appointment');
        const Staff = require('./models/Staff');
        const Attendance = require('./models/Attendance');
        const Equipment = require('./models/Equipment');
        const Patient = require('./models/Patient');

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // 1. Appointments Today
        const appointmentsToday = await Appointment.countDocuments({
            date: { $gte: todayStart, $lte: todayEnd }
        });

        // 2. Staff On Duty (Present today)
        const staffOnDuty = await Attendance.countDocuments({
            date: { $gte: todayStart, $lte: todayEnd },
            status: 'Present'
        });
        const totalStaff = await Staff.countDocuments();

        // 3. Equipment Stats
        const equipmentAvailable = await Equipment.countDocuments({ status: 'Available' });
        const equipmentInUse = await Equipment.countDocuments({ status: 'In Use' });
        const equipmentMaintenance = await Equipment.countDocuments({ status: 'Maintenance' });

        // 4. Total Patients
        const totalPatients = await Patient.countDocuments();

        // 5. Recent Appointments (Last 5)
        const recentAppointments = await Appointment.find()
            .sort({ date: -1, time: -1 })
            .limit(5)
            .populate('patientId', 'name')
            .populate('doctorId', 'name');

        res.json({
            appointmentsToday,
            staffOnDuty: staffOnDuty || 0,
            totalStaff,
            equipmentAvailable,
            equipmentInUse,
            equipmentMaintenance,
            totalPatients,
            recentAppointments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
