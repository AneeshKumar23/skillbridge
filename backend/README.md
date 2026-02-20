
# SkillBridge Backend

## Stack

- **FastAPI** — REST API + AI routes (Gemini)
- **Supabase** — PostgreSQL database, Auth (JWT), Storage (certificate PNGs)
- **Docker** — containerised deployment

---

## 1 · Supabase Project Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the contents of [`schema.sql`](./schema.sql) to create tables and RLS policies.
3. In **Storage → Buckets**, create a bucket named **`certificates`** and set it to **Public**.
4. In **Authentication → Settings**, disable **Email Confirmations** for local development (optional — if enabled, users must verify email before the session token is issued on sign-up).

---

## 2 · Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Google Gemini
MODEL_API_KEY=your_gemini_api_key
MODEL_NAME=gemini-pro

# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key   # Settings → API → service_role

# Optional: YouTube Data API (for /api/generate_youtube_content)
YOUTUBE_API_KEY=your_youtube_api_key
```

> ⚠️ Use the **service_role** key (not the anon key) — it bypasses Row Level Security so FastAPI can read/write freely.

---

## 3 · Run with Docker

```bash
docker compose build backend
docker compose up -d
```

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4 · Run Locally (without Docker)

```bash
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/` | Sign up (Supabase Auth + profile row) |
| GET | `/users/{id}` | Get user profile |
| POST | `/login` | Sign in → returns JWT `access_token` |
| PUT | `/users/{id}/onboarding` | Save language, location, skills |
| POST | `/prompts/{id}` | Append a chat prompt |
| GET | `/prompts/{id}` | Fetch all prompts |
| GET | `/outputs/{id}` | Fetch all outputs (certificates, etc.) |
| POST | `/certificate/{id}` | Generate PNG → upload to Supabase Storage |
| POST | `/api/chat` | Gemini conversational AI |
| POST | `/api/generate_content` | Gemini structured learning path (JSON) |
| POST | `/api/suggest_skills` | Gemini skill suggestions |
| POST | `/api/generate_youtube_content` | YouTube videos for a topic |
| POST | `/api/generate_article` | Article links via Gemini |

---

## Auth Flow

```
Signup  →  POST /users/  →  Supabase Auth sign_up  →  profile row inserted
                          →  returns { id, access_token }

Login   →  POST /login   →  Supabase Auth sign_in_with_password
                          →  returns { user_id, access_token, token_type }
```

The frontend stores `userId` and `accessToken` in `localStorage` and sends
`Authorization: Bearer <token>` on protected requests.


## 📡 API Reference

SkillBridge provides a RESTful API for managing users, prompts, outputs, and AI-generated content. Below is a summary of available endpoints.

---

### 👤 User Management

#### ➕ Create a User

```http
POST /users/
```

**Body Parameters:**

| Parameter    | Type     | Description                   |
| ------------ | -------- | ----------------------------- |
| `email`      | `string` | **Required**. User email      |
| `first_name` | `string` | **Required**. User first name |
| `last_name`  | `string` | **Optional**. User last name  |

---

#### 📄 Get a User

```http
GET /users/{user_id}
```

**Path Parameters:**

| Parameter | Type     | Description                  |
| --------- | -------- | ---------------------------- |
| `user_id` | `string` | **Required**. ID of the user |

---

### 💬 Prompt Management

#### ➕ Add Prompt

```http
POST /prompts/{user_id}
```

**Query Parameters:**

| Parameter | Type     | Description               |
| --------- | -------- | ------------------------- |
| `prompt`  | `string` | **Required**. Prompt text |

---

#### 📄 Get Prompts

```http
GET /prompts/{user_id}
```

**Path Parameters:**

| Parameter | Type     | Description                  |
| --------- | -------- | ---------------------------- |
| `user_id` | `string` | **Required**. ID of the user |

---

### 📤 Output Management

#### ➕ Add Output

```http
POST /outputs/{user_id}
```

**Query Parameters:**

| Parameter | Type     | Description                  |
| --------- | -------- | ---------------------------- |
| `output`  | `string` | **Required**. Output content |

---

#### 📄 Get Outputs

```http
GET /outputs/{user_id}
```

**Path Parameters:**

| Parameter | Type     | Description                  |
| --------- | -------- | ---------------------------- |
| `user_id` | `string` | **Required**. ID of the user |

---

### 🧠 AI-Generated Content

#### 📰 Generate Article Links

```http
POST /api/generate_article
```

**Query Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `prompt`  | `string` | **Required**. Prompt input |

---

#### 📺 Generate YouTube Content Links

```http
POST /api/generate_youtube_content
```

**Query Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `prompt`  | `string` | **Required**. Prompt input |

---

#### 🧾 Generate Certificate

```http
POST /certificate/{user_id}
```

**Path Parameters:**

| Parameter | Type     | Description                  |
| --------- | -------- | ---------------------------- |
| `user_id` | `string` | **Required**. ID of the user |

Returns a URL to a generated certificate.

---

#### 📚 Generate Custom Content (Gemini)

```http
POST /api/generate_content
```

**Query Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `prompt`  | `string` | **Required**. Prompt input |

