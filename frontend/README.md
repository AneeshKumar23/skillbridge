# SkillBridge — Frontend

> React + TypeScript + Vite single-page application

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Data fetching | TanStack Query (React Query) |
| Routing | React Router DOM |
| Package manager | Bun (lockfile) / npm compatible |

---

## Prerequisites

- Node.js 18+
- npm, yarn, or bun

---

## Local Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 8080)
npm run dev
```

App → [http://localhost:8080](http://localhost:8080)  
Backend must be running on [http://localhost:8000](http://localhost:8000) — see `../backend/README.md`.

---

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Index.tsx          # Landing page
│   │   ├── Login.tsx          # Login form
│   │   ├── Signup.tsx         # Signup form
│   │   ├── Onboarding.tsx     # Language / location / skills slides
│   │   ├── Chat.tsx           # AI chat + learning path
│   │   └── Certificates.tsx   # User certificates
│   ├── components/
│   │   ├── chat/              # ChatContainer, ChatInput, LearningPath, Reference
│   │   ├── landing/           # About, Features, Courses, Contact
│   │   ├── onboarding/        # LanguageSlide, LocationSlide, SkillSlide, LoadingSlide
│   │   └── ui/                # shadcn/ui components
│   ├── context/
│   │   └── UserContext.tsx    # Global user state + loginUser / logoutUser
│   └── hooks/
│       └── use-mobile.tsx
├── api/
│   ├── db.ts                  # All FastAPI calls + JWT session helpers
│   └── stt.ts                 # Speech-to-text (ElevenLabs)
└── public/
```

---

## Auth

- Login / signup calls hit the FastAPI backend at `/login` and `/users/`.
- On success the JWT `access_token` and `userId` are stored in `localStorage` via helpers in `api/db.ts` (`storeSession`, `clearSession`).
- Protected requests include `Authorization: Bearer <token>`.

---

## Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

