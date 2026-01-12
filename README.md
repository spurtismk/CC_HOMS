# HOMS - Hospital Operations Management System

A cloud-based hospital operations management system built with Node.js, Express, and MongoDB.

## Features
- **User Management**: Admin/Staff roles.
- **Staff Management**: Doctors, Nurses, etc.
- **Patient Management**: Records.
- **Appointments**: Scheduling.
- **Attendance**: Shift logging.
- **Equipment**: Availability tracking.
- **Dashboard**: Overview stats.

## Setup Instructions

1.  **Navigate to Backend**
    ```bash
    cd backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    - The `.env` file is in the `backend` folder.
    - Database: `homs_db` in the cluster.

4.  **Database Seeding (First Run Only)**
    - Run the seed script to create the initial Admin user.
    ```bash
    node seed.js
    ```
    - **Default Admin Config**:
        - Username: `admin`
        - Password: `password123`

5.  **Run the Server**
    ```bash
    node server.js
    ```
    - Server runs on `http://localhost:5000`.
    - **Frontend is served automatically** at `http://localhost:5000`.

## Project Structure
- `backend/`:
    - `server.js`: Main backend entry point.
    - `models/`, `routes/`, `middleware/`: Backend logic.
- `frontend/`: 
    - `index.html`, `dashboard.html`.
    - `css/`, `js/`: Static assets.
