# Ride-Sharing Platform - Milestone 1

Full-stack ride-sharing platform with Spring Boot backend, React frontend, and MySQL database.

## Features
- **Authentication**: JWT-based login and registration.
- **Verification**: Email token verification (placeholder logic in backend).
- **Profile**: Protected dashboard showing user details.
- **UI**: Modern dark theme using Tailwind CSS.

## Prerequisite Setup

### 1. Database (MySQL)
Run the `schema.sql` script in your MySQL terminal or workbench:
```bash
mysql -u root -p < schema.sql
```

### 2. Backend (Spring Boot)
- Navigate to `ride-backend`.
- Configure `src/main/resources/application.properties` with your MySQL password and Gmail SMTP details.
- To get a Gmail App Password:
  1. Go to Google Account Security.
  2. Enable 2-Step Verification.
  3. Search for "App Passwords" and generate one for "Mail".
- Run the project:
  ```bash
  mvn spring-boot:run
  ```

### 3. Frontend (React + Vite)
- Navigate to `ride-frontend`.
- Install dependencies:
  ```bash
  npm install
  ```
- Start development server:
  ```bash
  npm run dev
  ```
- The app will run at `http://localhost:5173`.

## API Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Authenticate and get JWT
- `GET /api/auth/verify?token=...` - Verify email
- `GET /api/users/profile` - Get logged-in user info (Secured)
