# AI-Assisted Research Project & Publication Tracker

A full-stack starter application for managing research projects and tracking publications.

## Features
- Register, log in, and log out using JWT authentication
- Dashboard with project/publication counts and publication status chart
- Create, view, update, and delete research projects
- Create, view, update, and delete publication records
- AI-assisted writing helper (local template-based suggestions; no external AI key required)
- Export publication records to CSV
- SQLite by default; supports MySQL through `DATABASE_URL`
- REST API with health endpoint

## Tech stack
- Frontend: React, Vite, React Router, Recharts
- Backend: Python 3.10+, Flask, Flask-SQLAlchemy, Flask-JWT-Extended
- Database: SQLite default / MySQL optional

## 1. Start the backend (Windows PowerShell)
```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python run.py
```
Backend: http://127.0.0.1:5000

If PowerShell blocks activation, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```
Or use Command Prompt:
```bat
.venv\Scripts\activate.bat
```

## 2. Start the frontend (open a second terminal)
```powershell
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## Demo workflow
1. Open the frontend URL.
2. Register with your name, email, and password.
3. Log in.
4. Add a research project.
5. Add a publication and change its status as it progresses.
6. Use the AI Writing Helper for structured prompts and export publications as CSV.

## Optional MySQL setup
Create a database, for example `research_tracker`, then update `backend/.env`:
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/research_tracker
```
Install the included requirements again. SQLite is used when `DATABASE_URL` is not set.

## API overview
All protected routes require:
`Authorization: Bearer <access_token>`

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET|POST /api/projects`
- `GET|PUT|DELETE /api/projects/<id>`
- `GET|POST /api/publications`
- `GET|PUT|DELETE /api/publications/<id>`
- `GET /api/publications/export`
- `POST /api/assistant/suggest`
- `GET /api/health`

## Notes
- Change `JWT_SECRET_KEY` and `SECRET_KEY` before deployment.
- This is a learning/development project. Before production deployment, add email verification, password reset, rate limiting, HTTPS, database backups, and a hosted AI provider if required.
