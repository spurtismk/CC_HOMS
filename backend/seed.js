const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Models
const User = require('./models/User');
const Staff = require('./models/Staff');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Attendance = require('./models/Attendance');
const Equipment = require('./models/Equipment');

dotenv.config();

/* ------------------ CONFIG GUARDS ------------------ */

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not set');
  process.exit(1);
}

if (!process.env.ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD not set');
  process.exit(1);
}

const IS_PROD = process.env.NODE_ENV === 'production';

/* ------------------ SAMPLE DATA ------------------ */

const indianNames = [
  "Aarav Patel", "Vihaan Rao", "Aditya Sharma", "Sai Kumar", "Reyansh Gupta",
  "Ishaan Verma", "Diya Singh", "Ananya Iyer", "Saanvi Chatterjee", "Aadhya Nair"
];

const departments = [
  "Cardiology", "Neurology", "Orthopedics",
  "Pediatrics", "General Medicine", "Emergency"
];

const equipmentList = [
  { name: "MRI Machine", dept: "Radiology", status: "Available" },
  { name: "CT Scanner", dept: "Radiology", status: "Maintenance" },
  { name: "Ventilator A1", dept: "ICU", status: "In Use" },
  { name: "Ventilator A2", dept: "ICU", status: "Available" },
  { name: "X-Ray Machine", dept: "Orthopedics", status: "Available" },
  { name: "ECG Monitor", dept: "Cardiology", status: "In Use" },
  { name: "Defibrillator", dept: "Emergency", status: "Available" },
  { name: "Ultrasound", dept: "Gynecology", status: "Available" },
  { name: "Dialysis Machine", dept: "Nephrology", status: "Maintenance" },
  { name: "Infusion Pump", dept: "General Medicine", status: "Available" }
];

/* ------------------ DB CONNECT ------------------ */

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected');
};

/* ------------------ ADMIN SEED (SAFE) ------------------ */

const seedAdmin = async () => {
  const admin = await User.findOne({ role: 'admin' });

  if (admin) {
    console.log('ℹ️ Admin already exists. Skipping.');
    return;
  }

  await User.create({
    username: 'admin',
    password: process.env.ADMIN_PASSWORD,
    role: 'admin'
  });

  console.log('✅ Admin user created');
};

/* ------------------ DEMO DATA SEED (LOCAL ONLY) ------------------ */

const seedDemoData = async () => {
  if (IS_PROD) {
    console.log('🚫 Demo seeding blocked in production');
    return;
  }

  const staffCount = await Staff.countDocuments();
  if (staffCount > 0) {
    console.log('ℹ️ Demo data already exists. Skipping.');
    return;
  }

  console.log('⚠️ Seeding demo data (development only)');

  /* Staff */
  const staffDocs = [];
  for (let i = 0; i < 10; i++) {
    staffDocs.push({
      name: i < 5 ? `Dr. ${indianNames[i]}` : `Nurse ${indianNames[i]}`,
      designation: i < 5 ? "Doctor" : "Nurse",
      department: departments[i % departments.length],
      contact: `987654321${i}`
    });
  }
  const staff = await Staff.insertMany(staffDocs);

  /* Patients */
  const patients = await Patient.insertMany(
    Array.from({ length: 15 }).map((_, i) => ({
      name: indianNames[i % indianNames.length],
      age: 20 + Math.floor(Math.random() * 60),
      gender: i % 2 === 0 ? "Male" : "Female",
      contact: `912345678${i}`,
      emergencyContact: `998877665${i}`,
      medicalHistory: "Routine checkup history..."
    }))
  );

  /* Appointments */
  const doctors = staff.filter(s => s.designation === 'Doctor');
  await Appointment.insertMany(
    doctors.slice(0, 5).map((d, i) => ({
      patientId: patients[i]._id,
      doctorId: d._id,
      date: new Date(),
      time: `${9 + i}:00`,
      status: "Scheduled"
    }))
  );

  /* Attendance */
  await Attendance.insertMany(
    staff
      .filter((_, i) => i % 2 === 0)
      .map(s => ({
        staffId: s._id,
        date: new Date(),
        shift: "Morning",
        status: "Present"
      }))
  );

  /* Equipment */
  await Equipment.insertMany(
    equipmentList.map(e => ({
      name: e.name,
      department: e.dept,
      status: e.status
    }))
  );

  console.log('✅ Demo data seeded');
};

/* ------------------ RUN ------------------ */

const runSeed = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedDemoData();
    console.log('🎉 Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

runSeed();
