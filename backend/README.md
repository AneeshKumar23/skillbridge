
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

# Start the server (option A — venv activated)
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Start the server (option B — no activation needed, full path)
.\venv\Scripts\python.exe -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

> **Port conflict?** If port 8000 is already taken, run:
> ```powershell
> $p = netstat -ano | Select-String ':8000\s' | Select-String 'LISTENING'
> if ($p) { Stop-Process -Id ($p.ToString().Trim() -split '\s+')[-1] -Force }
> ```

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

The API is organised around the user journey: **Auth → Onboarding → Skills → Roadmap → Chat / Resources → Certificate**.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/` | Sign up → Supabase Auth + profile row |
| `GET` | `/users/{id}` | Get user profile |
| `POST` | `/login` | Sign in → returns JWT `access_token` |

### Onboarding

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/users/{id}/onboarding` | Save language → `user_languages`, skills → `user_skills`, location → `users` |
| `GET` | `/users/{id}/languages` | Get language history — `[{language, created_at}]` |

### Skills

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/{id}/skills/suggest` | Body `{interest}` → AI suggests skills *(not saved yet)* |
| `PUT` | `/users/{id}/skills` | Body `{skills}` → upsert confirmed skills to `user_skills` table |
| `GET` | `/users/{id}/skills` | Get skill history — `[{skill, status, created_at}]` |
| `PATCH` | `/users/{id}/skills/{skill}` | Body `{status}` → update skill status (`active` \| `completed` \| `paused`) |

### Roadmap

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/{id}/roadmap` | Body `{skill}` → generate learning path via Gemini + **save to DB** |
| `GET` | `/users/{id}/roadmap` | Get all saved roadmaps |
| `GET` | `/users/{id}/roadmap/{skill}` | Get latest roadmap for a specific skill |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/{id}/chat` | Body `{message}` → user turn + AI reply both **saved to DB** |
| `GET` | `/users/{id}/chat` | Full conversation history (role + content + timestamp) |

### Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/{id}/resources/youtube` | Body `{topic}` → fetch YouTube videos + **save to DB** |
| `POST` | `/users/{id}/resources/articles` | Body `{topic}` → fetch article links + **save to DB** |
| `GET` | `/users/{id}/resources` | All saved resources (`?type=youtube\|article\|certificate`) |

### Certificate

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/certificate/{id}` | Generate PNG → upload to Supabase Storage → **save URL to DB** |

---

## User Journey + DB Writes

```
1. Signup        POST /users/                           → users table
2. Login         POST /login                            → JWT issued
3. Onboarding    PUT  /users/{id}/onboarding            → users + user_languages + user_skills
                 GET  /users/{id}/languages             → read from user_languages
4. Skills        POST /users/{id}/skills/suggest        → AI only, no write
                 PUT  /users/{id}/skills                → user_skills (upsert)
                 GET  /users/{id}/skills                → skill history [{skill, status, created_at}]
                 PATCH /users/{id}/skills/{skill}       → update status in user_skills
5. Roadmap       POST /users/{id}/roadmap               → user_roadmaps (JSONB)
                 GET  /users/{id}/roadmap[/{skill}]     → read from user_roadmaps
6. Chat          POST /users/{id}/chat                  → user_chat_messages ×2 (user + assistant)
                 GET  /users/{id}/chat                  → full history
7. Resources     POST /users/{id}/resources/youtube     → user_resources (type=youtube)
                 POST /users/{id}/resources/articles    → user_resources (type=article)
                 GET  /users/{id}/resources             → filtered by ?type=
8. Certificate   POST /certificate/{id}                 → Supabase Storage + user_resources (type=certificate)
```

The frontend stores `userId` and `accessToken` in `localStorage` and sends  
`Authorization: Bearer <token>` on protected requests.

---

## Project Structure

```
backend/
├── app.py              # All FastAPI routes + service layer
├── config.py           # Environment variable loading
├── model.py            # Pydantic request/response models
├── utils.py            # Certificate generation, Gemini helpers, YouTube search
├── db.py               # SQLAlchemy models (Alembic only — not used at runtime)
├── alembic.ini         # Alembic config (DATABASE_URL loaded from .env)
├── migrations/
│   ├── env.py
│   └── versions/
│       ├── 0001_initial.py              # users, user_prompts, user_outputs
│       ├── 0002_modular_tables.py       # user_chat_messages, user_roadmaps, user_resources
│       ├── 0003_fix_grants.py           # RLS + grants for modular tables
│       └── 0004_skills_language_tables.py  # user_skills, user_languages (with data migration)
├── requirements.txt
├── backend.dockerfile
├── docker-compose.yml
└── schema.sql          # SQL reference (Alembic is the source of truth)
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Profile + location + skills/language (kept in sync) |
| `user_profile_items` | Unified skill + language history — `type` (`skill`/`language`), `value`, `status` |
| `user_chat_messages` | Full chat history — `role` (`user`/`assistant`) + `content` |
| `user_roadmaps` | Gemini-generated learning path per skill — `skill` + `roadmap` (JSONB) |
| `user_resources` | YouTube videos, articles, certificates — `type` + `topic` + `data` (JSONB) |
| `user_prompts` *(legacy)* | Old prompt store — no longer written to |
| `user_outputs` *(legacy)* | Old output store — no longer written to |
