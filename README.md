# EduFlow - E-Learning Platform

A full-stack E-Learning Platform built with Spring Boot, React, and MySQL.

## Prerequisites
- Docker and Docker Compose
- Node.js (v16 or higher)
- Maven (optional, but recommended for backend changes)

## How to Run

### 1. Start the Backend and Databases (Docker)
The backend service, MySQL database, phpMyAdmin, and MinIO storage are containerized.
Run the following command in the root folder of the project:
```bash
docker-compose up -d
```
*Wait a few seconds for MySQL to initialize and the backend Spring Boot app to start. The database schema and initial mock data (courses, users) will be automatically imported.*

### 2. Start the Frontend (React)
Open a new terminal, navigate to the `elearning_FE` folder, install the dependencies, and start the development server:
```bash
cd elearning_FE
npm install
npm run dev
```

### 3. Access the Application
- **Frontend (Web App):** http://localhost:5173 (or whatever port Vite uses)
- **Backend API:** http://localhost:8088/api/v1
- **MinIO Storage Console:** http://localhost:9001 (User: `admin` / Pass: `12345678`)
- **PGAdmin (DB Client):** http://localhost:8081 (User: `root` / Pass: `123`)

## Note on Missing Media (MinIO)
When you first pull and run this project, the MinIO bucket will be empty, meaning that initial courses might have missing thumbnails or video files.
The frontend has been configured to **gracefully fallback** to placeholder images when files are missing, so the app will not crash or break. You can test uploading new videos, documents, and images natively through the Lecturer Dashboard!
