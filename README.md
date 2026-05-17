# Smart Campus Complaint & Analytics System

A three-service complaint platform for students and campus admins:

- `frontend/`: shared React 18 + Vite + Tailwind source that runs as two separate frontend apps: Student Portal and Admin Portal.
- `backend/`: Node.js + Express REST API with JWT auth, Prisma, PostgreSQL, Cloudinary uploads, email hooks, CSV export, and analytics.
- `nlp-service/`: Python Flask classifier service with keyword rules now and TF-IDF + Logistic Regression training hooks for phase 2.

## Local Setup

1. Copy environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp nlp-service/.env.example nlp-service/.env
   ```

2. Start PostgreSQL, Redis, NLP, backend, and both frontend containers:

   ```bash
   docker compose up --build
   ```

   Student frontend: `http://localhost:5173`

   Admin frontend: `http://localhost:5174`

3. For manual backend development:

   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run seed
   ```

4. For manual frontend development, run the two portals in separate terminals:

   ```bash
   cd frontend
   npm install
   npm run dev:student
   ```

   ```bash
   cd frontend
   npm run dev:admin
   ```

5. Admin registration requires `ADMIN_REGISTRATION_KEY` from `backend/.env`.

## API Overview

Auth:

- `POST /api/auth/student/register`
- `POST /api/auth/student/login`
- `POST /api/auth/student/login/verify-mfa`
- `POST /api/auth/admin/register`
- `POST /api/auth/admin/login`
- `POST /api/auth/admin/login/verify-mfa`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Student complaints:

- `POST /api/complaints`
- `GET /api/complaints/mine`
- `GET /api/complaints/:id`

Admin:

- `GET /api/admin/complaints?category=&priority=&status=&page=&limit=`
- `PUT /api/admin/complaints/:id`
- `GET /api/admin/complaints/export`

Analytics:

- `GET /api/analytics/summary`
- `GET /api/analytics/by-category`
- `GET /api/analytics/status-ratio`
- `GET /api/analytics/monthly-trend`
- `GET /api/analytics/department-perf`

NLP:

- `POST /classify` with `{ "text": "..." }`

## Deployment Notes

- Frontend deploys to Vercel with `VITE_API_URL=https://your-backend.onrender.com/api`.
- Backend deploys to Render with `npm run prisma:deploy` as the migration step.
- NLP service deploys as a separate Render web service on port `5001`.
- PostgreSQL can be Render Postgres or any managed PostgreSQL provider.
- Set Cloudinary and Gmail App Password credentials only in Render/Vercel secrets.
- CI builds frontend, generates Prisma client, compiles Python, builds Docker images, pushes to Docker Hub, then calls Render deploy hooks when secrets are configured.
