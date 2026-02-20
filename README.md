# SkillBridge

> An AI-powered skill-learning platform — chat with Gemini, get structured learning paths, earn certificates.

---

## Monorepo Structure

```
skillbridge/
├── backend/   # FastAPI + Supabase + Gemini AI
└── frontend/  # React + TypeScript + Vite
```

- **Backend docs** → [backend/README.md](backend/README.md)
- **Frontend docs** → [frontend/README.md](frontend/README.md)

---

## Quick Start

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
.\venv\Scripts\alembic upgrade head
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

---

## Tech Stack

| Area | Technology |
|------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | FastAPI 0.116, Python 3.12, Uvicorn |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| AI | Google Gemini (`gemma-3-27b-it`) |
| Migrations | Alembic + SQLAlchemy |

---

## Environment Setup

Copy and fill in values:

```
backend/.env   ← SUPABASE_URL, SUPABASE_SERVICE_KEY, DATABASE_URL, MODEL_API_KEY, YOUTUBE_API_KEY
```

See [backend/README.md](backend/README.md#2--environment-variables) for all required keys.
