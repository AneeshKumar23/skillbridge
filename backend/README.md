
# SkillBridge — Backend

> FastAPI + Supabase (PostgreSQL · Auth · Storage) + Google Gemini AI

---

## Stack

| Layer | Technology |
|-------|-----------|
| API framework | FastAPI 0.116 + Uvicorn |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password → JWT) |
| Storage | Supabase Storage (certificate PNGs) |
| AI | Google Gemini (`gemma-3-27b-it`) |
| Migrations | Alembic + SQLAlchemy |
| Runtime | Python 3.12, venv |

---

## 1 · Supabase Project Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Storage → Buckets**, create a bucket named **`certificates`** and set it to **Public**.
3. In **Authentication → Settings**, disable **Email Confirmations** for local development (optional).

> Tables are created automatically by the Alembic migration — no need to run `schema.sql` manually.

---

## 2 · Environment Variables

Create `backend/.env`:

```env
# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key   # Settings → API → service_role (bypasses RLS)

# Supabase Postgres (for Alembic migrations)
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres

# Google Gemini
MODEL_API_KEY=your_gemini_api_key
MODEL_NAME=gemma-3-27b-it

# YouTube Data API v3 (for /api/generate_youtube_content)
YOUTUBE_API_KEY=your_youtube_api_key
```

> ⚠️ Never commit `.env` — it is listed in `.gitignore`.

---

## 3 · Local Setup

```powershell
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations
.\venv\Scripts\alembic upgrade head

# Start the server
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Swagger UI → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4 · Database Migrations (Alembic)

```powershell
# Apply all pending migrations
.\venv\Scripts\alembic upgrade head

# Check current revision
.\venv\Scripts\alembic current

# Create a new migration after editing db.py models
.\venv\Scripts\alembic revision --autogenerate -m "describe_your_change"
```

Migrations live in `migrations/versions/`. The `db.py` file contains SQLAlchemy models used **only** by Alembic — runtime queries use `supabase-py`.

---

## 5 · Run with Docker

```bash
docker compose build backend
docker compose up -d
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/` | Sign up → Supabase Auth + profile row |
| `GET` | `/users/{id}` | Get user profile |
| `POST` | `/login` | Sign in → returns JWT `access_token` |
| `PUT` | `/users/{id}/onboarding` | Save language, location, skills |
| `POST` | `/prompts/{id}` | Add a chat prompt |
| `GET` | `/prompts/{id}` | Fetch all prompts |
| `GET` | `/outputs/{id}` | Fetch all outputs |
| `POST` | `/certificate/{id}` | Generate certificate PNG → Supabase Storage |
| `POST` | `/api/chat` | Gemini conversational AI |
| `POST` | `/api/generate_content` | Gemini structured learning path (JSON) |
| `POST` | `/api/suggest_skills` | Gemini skill suggestions |
| `POST` | `/api/generate_youtube_content` | YouTube videos for a topic |
| `POST` | `/api/generate_article` | Article links via Gemini |

---

## Auth Flow

```
Signup  →  POST /users/
              └─ supabase.auth.sign_up()  →  auth.users row
              └─ supabase table insert    →  public.users profile row
              └─ returns { id, access_token }

Login   →  POST /login
              └─ supabase.auth.sign_in_with_password()
              └─ returns { user_id, access_token, token_type }
```

The frontend stores `userId` and `accessToken` in `localStorage` and sends  
`Authorization: Bearer <token>` on protected requests.

---

## Project Structure

```
backend/
├── app.py              # All FastAPI routes
├── config.py           # Environment variable loading
├── model.py            # Pydantic request/response models
├── utils.py            # Certificate generation, AI helpers, YouTube search
├── db.py               # SQLAlchemy models (Alembic only, not used at runtime)
├── alembic.ini         # Alembic config (DATABASE_URL loaded from .env)
├── migrations/
│   ├── env.py
│   └── versions/
│       └── 0001_initial.py   # Creates users, user_prompts, user_outputs + RLS
├── requirements.txt
├── backend.dockerfile
├── docker-compose.yml
└── schema.sql          # SQL reference (informational; Alembic is the source of truth)
```
