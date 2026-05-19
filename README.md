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

- Frontend deploys to Vercel with `VITE_API_URL=https://your-backend.onrender.com`.
- Backend Docker deploys to Render using `backend/Dockerfile`. Leave Render's Docker start command blank so the image runs `npm run prisma:deploy` before `node src/server.js`. If you override it in Render, use `sh -c "npm run prisma:deploy && exec node src/server.js"`.
- For deployed frontend/backend on different domains, set `NODE_ENV=production` on the backend and set `CLIENT_URL`, `STUDENT_CLIENT_URL`, and `ADMIN_CLIENT_URL` to the exact HTTPS Vercel frontend origins so CORS allows credentialed refresh-token cookies.
- Login OTP emails are sent with `SENDGRID_API_KEY` when configured, otherwise the backend falls back to SMTP using `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM`. Twilio settings are present for future Verify integration, but the current login MFA flow does not use Twilio.
- Set the same strong `RELOAD_SECRET` value on both backend and NLP services. Backend sends it as `X-NLP-Secret`; NLP rejects prediction, explain, metadata, and reload requests without it.
- NLP service deploys as a separate Render web service on port `5001` with `ENVIRONMENT=production` and `NLP_REQUIRE_SECRET=true`.
- PostgreSQL can be Render Postgres or any managed PostgreSQL provider.
- Set Cloudinary, SendGrid/Gmail, Twilio, database, Redis, JWT, and NLP secrets only in Render/Vercel environment variables. Do not commit `.env`, `.env.student`, or `.env.admin` files.
- CI builds frontend, generates Prisma client, compiles Python, builds Docker images, pushes to Docker Hub, then calls Render deploy hooks when secrets are configured.
