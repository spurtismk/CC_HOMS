let currentUser = null;

// Init
document.addEventListener('DOMContentLoaded', async () => {
    try {
        currentUser = await fetchAPI('/auth/me');
        if (!currentUser) {
            window.location.href = '/index.html';
            return;
        }

        document.getElementById('user-display-name').textContent = currentUser.username + ` (${currentUser.role})`;

        // Show Admin only links
        if (currentUser.role === 'admin') {
            document.getElementById('nav-users').style.display = 'block';
        }

        // Load initial data (Dashboard)
        loadDashboard();

        // Setup Navigation triggers
        setupNavigation();

        // Setup Logout
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            await fetchAPI('/auth/logout', 'POST');
            window.location.href = '/index.html';
        });

        // Setup Forms
        setupForms();

    } catch (err) {
        console.error(err);
        window.location.href = '/index.html';
    }
});

function setupNavigation() {
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            // UI Update
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';

            // Load Data based on target
            if (targetId === 'dashboard') loadDashboard();
            else if (targetId === 'users') loadUsers();
            else if (targetId === 'staff') loadStaff();
            else if (targetId === 'patients') loadPatients();
            else if (targetId === 'appointments') loadAppointments();
            else if (targetId === 'attendance') loadAttendance();
            else if (targetId === 'equipment') loadEquipment();
        });
    });
}

// Global variable to store editing ID
let currentEditId = null;

// --- Loaders ---

async function loadDashboard() {
    try {
        const stats = await fetchAPI('/dashboard/stats');

        // Update Stats Cards
        document.getElementById('sc-patients').textContent = stats.totalPatients || 0;
        document.getElementById('sc-appointments').textContent = stats.appointmentsToday || 0;
        document.getElementById('sc-staff').textContent = stats.staffOnDuty || 0;
        document.getElementById('sc-equipment').textContent = stats.equipmentAvailable || 0;

        // Render Recent Activity
        const recentTableBody = document.querySelector('#recentTable tbody');
        recentTableBody.innerHTML = '';

        if (stats.recentAppointments && stats.recentAppointments.length > 0) {
            stats.recentAppointments.forEach(app => {
                const patName = app.patientId ? app.patientId.name : 'Unknown';
                const docName = app.doctorId ? app.doctorId.name : 'Unknown';
                const time = app.time;
                const statusBadge = `<span class="badge badge-${getStatusBadge(app.status)}">${app.status}</span>`;

                recentTableBody.innerHTML += `
                    <tr>
                        <td>${patName}</td>
                        <td>${docName}</td>
                        <td>${time}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            });
        } else {
            recentTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #999;">No recent appointments</td></tr>';
        }

    } catch (err) {
        console.error('Failed to load stats', err);
    }
}

async function loadUsers() {
    if (currentUser.role !== 'admin') return;
    const users = await fetchAPI('/users');
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';
    users.forEach(user => {
        tbody.innerHTML += `
            <tr>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editUser('${user._id}', '${user.username}', '${user.role}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteItem('/users', '${user._id}', loadUsers)">Delete</button>
                </td>
            </tr>
        `;
    });
}

async function loadStaff() {
    const staffList = await fetchAPI('/staff');
    const tbody = document.querySelector('#staffTable tbody');
    tbody.innerHTML = '';
    staffList.forEach(staff => {
        const deleteBtn = currentUser.role === 'admin' ?
            `<button class="btn btn-danger" onclick="deleteItem('/staff', '${staff._id}', loadStaff)">Delete</button>` : '';
        const editBtn = currentUser.role === 'admin' ?
            `<button class="btn btn-secondary" onclick='editStaff(${JSON.stringify(staff)})'>Edit</button>` : '';

        tbody.innerHTML += `
            <tr>
                <td>${staff.name}</td>
                <td>${staff.designation}</td>
                <td>${staff.department}</td>
                <td>${staff.contact}</td>
                <td>${editBtn} ${deleteBtn}</td>
            </tr>
        `;
    });
}

async function loadPatients() {
    const patients = await fetchAPI('/patients');
    const tbody = document.querySelector('#patientsTable tbody');
    tbody.innerHTML = '';
    patients.forEach(patient => {
        const deleteBtn = currentUser.role === 'admin' ?
            `<button class="btn btn-danger" onclick="deleteItem('/patients', '${patient._id}', loadPatients)">Delete</button>` : '';

        tbody.innerHTML += `
            <tr>
                <td>${patient.name}</td>
                <td>${patient.age} / ${patient.gender}</td>
                <td>${patient.contact}</td>
                <td>${patient.emergencyContact}</td>
                <td>
                    <button class="btn btn-secondary" onclick='editPatient(${JSON.stringify(patient)})'>Edit</button>
                    ${deleteBtn}
                </td>
            </tr>
        `;
    });
}

async function loadAppointments() {
    const apps = await fetchAPI('/appointments');
    const tbody = document.querySelector('#appointmentsTable tbody');
    tbody.innerHTML = '';
    apps.forEach(app => {
        const patientName = app.patientId ? app.patientId.name : 'Unknown';
        const doctorName = app.doctorId ? app.doctorId.name : 'Unknown';
        // Format Date
        const dateObj = new Date(app.date);
        const dateStr = dateObj.toLocaleDateString() + ' ' + app.time;

        tbody.innerHTML += `
            <tr>
                <td>${patientName}</td>
                <td>${doctorName}</td>
                <td>${dateStr}</td>
                <td><span class="badge badge-${getStatusBadge(app.status)}">${app.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick='editAppointment(${JSON.stringify(app)})'>Edit</button>
                    <button class="btn btn-danger" onclick="deleteItem('/appointments', '${app._id}', loadAppointments)">Delete</button>
                </td>
            </tr>
        `;
    });
}

async function loadAttendance() {
    const list = await fetchAPI('/attendance');
    const tbody = document.querySelector('#attendanceTable tbody');
    tbody.innerHTML = '';
    list.forEach(att => {
        const staffName = att.staffId ? att.staffId.name : 'Unknown';
        const dateStr = new Date(att.date).toLocaleDateString();

        const deleteBtn = currentUser.role === 'admin' ?
            `<button class="btn btn-danger" onclick="deleteItem('/attendance', '${att._id}', loadAttendance)">Delete</button>` : '';

        tbody.innerHTML += `
            <tr>
                <td>${staffName}</td>
                <td>${dateStr}</td>
                <td>${att.shift}</td>
                <td><span class="badge badge-${getStatusBadge(att.status)}">${att.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick='editAttendance(${JSON.stringify(att)})'>Edit</button>
                    ${deleteBtn}
                </td>
            </tr>
        `;
    });
}

async function loadEquipment() {
    const list = await fetchAPI('/equipment');
    const tbody = document.querySelector('#equipmentTable tbody');
    tbody.innerHTML = '';
    list.forEach(eq => {
        const deleteBtn = currentUser.role === 'admin' ?
            `<button class="btn btn-danger" onclick="deleteItem('/equipment', '${eq._id}', loadEquipment)">Delete</button>` : '';

        // Admin can edit everything, Staff can update status potentially? 
        // For now letting everyone edit via modal, backend protects if needed, but requirements say Staff view availability.
        // I will let staff edit status.

        tbody.innerHTML += `
            <tr>
                <td>${eq.name}</td>
                <td>${eq.department}</td>
                <td><span class="badge badge-${getStatusBadge(eq.status)}">${eq.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick='editEquipment(${JSON.stringify(eq)})'>Edit</button>
                    ${deleteBtn}
                </td>
            </tr>
        `;
    });
}

function getStatusBadge(status) {
    if (['Present', 'Completed', 'Available'].includes(status)) return 'success';
    if (['Scheduled', 'Morning', 'Evening', 'Night', 'In Use'].includes(status)) return 'info';
    if (['Absent', 'Cancelled', 'Maintenance'].includes(status)) return 'danger';
    return 'warning';
}

// --- CRUD Operations ---

async function deleteItem(endpoint, id, callback) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
        await fetchAPI(`${endpoint}/${id}`, 'DELETE');
        callback();
    } catch (err) {
        alert(err.message);
    }
}

// --- Modals & Forms ---

// Helpers to open/close
window.openModal = function (modalId) {
    document.getElementById(modalId).classList.add('active');
    currentEditId = null; // Default to add mode
    // Reset form
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();

    // Set Title
    const titleEl = document.getElementById(modalId + 'Title');
    if (titleEl) titleEl.textContent = titleEl.textContent.replace('Edit', 'Add').replace('Update', 'Add');

    // Special Populates (Dropdowns)
    if (modalId === 'appointmentModal') populateAppointmentDropdowns();
    if (modalId === 'attendanceModal') populateAttendanceDropdowns();
}

window.closeModal = function (modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close on outside click
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

async function populateAppointmentDropdowns() {
    const patients = await fetchAPI('/patients');
    const staff = await fetchAPI('/staff'); // Filter doctors?

    const pSelect = document.getElementById('appPatient');
    pSelect.innerHTML = '';
    patients.forEach(p => pSelect.innerHTML += `<option value="${p._id}">${p.name}</option>`);

    const dSelect = document.getElementById('appDoctor');
    dSelect.innerHTML = '';
    staff.filter(s => s.designation === 'Doctor').forEach(s => dSelect.innerHTML += `<option value="${s._id}">${s.name}</option>`);
}

async function populateAttendanceDropdowns() {
    const staff = await fetchAPI('/staff');
    const sSelect = document.getElementById('attStaff');
    sSelect.innerHTML = '';
    staff.forEach(s => sSelect.innerHTML += `<option value="${s._id}">${s.name}</option>`);
}


// Edit Handlers (Prefill forms)

window.editUser = function (id, username, role) {
    currentEditId = id;
    document.getElementById('userUsername').value = username;
    document.getElementById('userRole').value = role;
    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('userModal').classList.add('active');
}

window.editStaff = function (staff) {
    currentEditId = staff._id;
    document.getElementById('staffName').value = staff.name;
    document.getElementById('staffDesignation').value = staff.designation;
    document.getElementById('staffDepartment').value = staff.department;
    document.getElementById('staffContact').value = staff.contact;
    document.getElementById('staffModalTitle').textContent = 'Edit Staff';
    document.getElementById('staffModal').classList.add('active');
}

window.editPatient = function (p) {
    currentEditId = p._id;
    document.getElementById('patientName').value = p.name;
    document.getElementById('patientAge').value = p.age;
    document.getElementById('patientGender').value = p.gender;
    document.getElementById('patientContact').value = p.contact;
    document.getElementById('patientEmergency').value = p.emergencyContact;
    document.getElementById('patientHistory').value = p.medicalHistory || '';
    document.getElementById('patientModalTitle').textContent = 'Edit Patient';
    document.getElementById('patientModal').classList.add('active');
}

window.editAppointment = async function (app) {
    currentEditId = app._id;
    await populateAppointmentDropdowns();
    // Set values
    document.getElementById('appPatient').value = app.patientId._id || app.patientId;
    document.getElementById('appDoctor').value = app.doctorId._id || app.doctorId;

    const d = new Date(app.date);
    const dateString = d.toISOString().split('T')[0];
    document.getElementById('appDate').value = dateString;
    document.getElementById('appTime').value = app.time;
    document.getElementById('appStatus').value = app.status;

    document.getElementById('appointmentModalTitle').textContent = 'Edit Appointment';
    document.getElementById('appointmentModal').classList.add('active');
}

window.editAttendance = async function (att) {
    currentEditId = att._id;
    await populateAttendanceDropdowns();
    document.getElementById('attStaff').value = att.staffId._id || att.staffId;
    const d = new Date(att.date);
    const dateString = d.toISOString().split('T')[0];
    document.getElementById('attDate').value = dateString;
    document.getElementById('attShift').value = att.shift;
    document.getElementById('attStatus').value = att.status;
    document.getElementById('attendanceModalTitle').textContent = 'Edit Attendance';
    document.getElementById('attendanceModal').classList.add('active');
}

window.editEquipment = function (eq) {
    currentEditId = eq._id;
    document.getElementById('eqName').value = eq.name;
    document.getElementById('eqDept').value = eq.department;
    document.getElementById('eqStatus').value = eq.status;
    document.getElementById('equipmentModalTitle').textContent = 'Update Equipment';
    document.getElementById('equipmentModal').classList.add('active');
}


// Form Submissions
function setupForms() {
    // User Form
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            username: document.getElementById('userUsername').value,
            role: document.getElementById('userRole').value
        };
        const pwd = document.getElementById('userPassword').value;
        if (pwd) data.password = pwd; // Only send if set

        // If adding new user, password is required
        if (!currentEditId && !pwd) {
            alert('Password required for new user');
            return;
        }

        const endpoint = currentEditId ? `/users/${currentEditId}` : '/users';
        const method = currentEditId ? 'PUT' : 'POST';

        await handleFormSubmit(endpoint, method, data, 'userModal', loadUsers);
    });

    // Staff Form
    document.getElementById('staffForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('staffName').value,
            designation: document.getElementById('staffDesignation').value,
            department: document.getElementById('staffDepartment').value,
            contact: document.getElementById('staffContact').value
        };
        const endpoint = currentEditId ? `/staff/${currentEditId}` : '/staff';
        const method = currentEditId ? 'PUT' : 'POST';
        await handleFormSubmit(endpoint, method, data, 'staffModal', loadStaff);
    });

    // Patient Form
    document.getElementById('patientForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('patientName').value,
            age: document.getElementById('patientAge').value,
            gender: document.getElementById('patientGender').value,
            contact: document.getElementById('patientContact').value,
            emergencyContact: document.getElementById('patientEmergency').value,
            medicalHistory: document.getElementById('patientHistory').value
        };
        const endpoint = currentEditId ? `/patients/${currentEditId}` : '/patients';
        const method = currentEditId ? 'PUT' : 'POST';
        await handleFormSubmit(endpoint, method, data, 'patientModal', loadPatients);
    });

    // Appointment Form
    document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            patientId: document.getElementById('appPatient').value,
            doctorId: document.getElementById('appDoctor').value,
            date: document.getElementById('appDate').value,
            time: document.getElementById('appTime').value,
            status: document.getElementById('appStatus').value
        };
        const endpoint = currentEditId ? `/appointments/${currentEditId}` : '/appointments';
        const method = currentEditId ? 'PUT' : 'POST';
        await handleFormSubmit(endpoint, method, data, 'appointmentModal', loadAppointments);
    });

    // Attendance Form
    document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            staffId: document.getElementById('attStaff').value,
            date: document.getElementById('attDate').value,
            shift: document.getElementById('attShift').value,
            status: document.getElementById('attStatus').value
        };
        const endpoint = currentEditId ? `/attendance/${currentEditId}` : '/attendance';
        const method = currentEditId ? 'PUT' : 'POST';
        await handleFormSubmit(endpoint, method, data, 'attendanceModal', loadAttendance);
    });

    // Equipment Form
    document.getElementById('equipmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('eqName').value,
            department: document.getElementById('eqDept').value,
            status: document.getElementById('eqStatus').value
        };
        const endpoint = currentEditId ? `/equipment/${currentEditId}` : '/equipment';
        const method = currentEditId ? 'PUT' : 'POST';
        await handleFormSubmit(endpoint, method, data, 'equipmentModal', loadEquipment);
    });
}

async function handleFormSubmit(endpoint, method, data, modalId, refreshCallback) {
    try {
        await fetchAPI(endpoint, method, data);
        closeModal(modalId);
        refreshCallback();
        // Also refresh dashboard stats if relevant
        loadDashboard();
    } catch (err) {
        alert(err.message);
    }
}
