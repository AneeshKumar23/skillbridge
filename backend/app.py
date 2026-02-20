from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from supabase import create_client, Client
import google.generativeai as genai
import json
import re
from typing import List, Optional
from dotenv import load_dotenv
from model import *
from utils import *
from config import *

# ── Bootstrap ─────────────────────────────────────────────────────────────────
load_dotenv()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
genai.configure(api_key=MODEL_API_KEY)

app = FastAPI(title="SkillBridge API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  HELPER — strip Markdown JSON fences from Gemini output                    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

def _parse_gemini_json(text: str):
    """Strip ```json … ``` fences (if present) then JSON-parse."""
    text = text.strip()
    text = re.sub(r'^```[a-zA-Z]*\n?', '', text)
    text = re.sub(r'\n?```$', '', text)
    return json.loads(text.strip())


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  SERVICE LAYER                                                              ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ── User ──────────────────────────────────────────────────────────────────────

class UserService:
    @staticmethod
    def get_user(user_id: str) -> dict:
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        return result.data[0]

    @staticmethod
    def create_user(user: UserCreate) -> dict:
        try:
            auth_resp = supabase.auth.sign_up({"email": user.email, "password": user.password})
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Auth sign-up failed: {e}")

        if not auth_resp.user:
            raise HTTPException(status_code=400, detail="Auth sign-up returned no user")

        auth_uid = auth_resp.user.id

        existing = supabase.table("users").select("id").eq("email", user.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="User already exists")

        supabase.table("users").insert({
            "id": auth_uid,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name or "",
            "phone_number": user.phone_number or "",
            "terms_and_conditions": user.terms_and_conditions,
            "street_address": "", "city": "", "state": "",
            "zip_code": "", "country": "", "language": "",
            "skills": [],
        }).execute()

        access_token = auth_resp.session.access_token if auth_resp.session else None
        return {"msg": "User created", "id": auth_uid, "access_token": access_token}


# ── Skills ────────────────────────────────────────────────────────────────────

class SkillService:
    @staticmethod
    def suggest(interest: str) -> List[str]:
        """Call Gemini to suggest skills. Does NOT save — frontend confirms first."""
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(
            f"Based on the user's interest: '{interest}', suggest 5-10 relevant digital skills. "
            "Respond only with a comma-separated list, no extra text."
        )
        return [s.strip() for s in response.text.split(",") if s.strip()]

    @staticmethod
    def save(user_id: str, skills: List[str]) -> dict:
        """Persist the confirmed skill list on the user's profile."""
        result = supabase.table("users").update({"skills": skills}).eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        return {"msg": "Skills saved", "skills": skills}


# ── Roadmap ───────────────────────────────────────────────────────────────────

class RoadmapService:
    @staticmethod
    def generate(user_id: str, skill: str) -> dict:
        """Generate a structured learning path for a skill, save to user_roadmaps."""
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(contents=BASE_PROMPT + skill)
        try:
            roadmap = _parse_gemini_json(response.text)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Gemini returned invalid JSON for roadmap")

        supabase.table("user_roadmaps").insert({
            "user_id": user_id,
            "skill": skill,
            "roadmap": roadmap,
        }).execute()

        return {"skill": skill, "roadmap": roadmap}

    @staticmethod
    def get_all(user_id: str) -> list:
        result = (
            supabase.table("user_roadmaps")
            .select("id, skill, roadmap, created_at")
            .eq("user_id", user_id)
            .order("created_at")
            .execute()
        )
        return result.data or []

    @staticmethod
    def get_by_skill(user_id: str, skill: str) -> dict:
        result = (
            supabase.table("user_roadmaps")
            .select("id, skill, roadmap, created_at")
            .eq("user_id", user_id)
            .eq("skill", skill)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail=f"No roadmap found for skill '{skill}'")
        return result.data[0]


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatService:
    @staticmethod
    def send(user_id: str, message: str) -> dict:
        """Save user message → call Gemini → save reply → return response."""
        supabase.table("user_chat_messages").insert({
            "user_id": user_id, "role": "user", "content": message,
        }).execute()

        try:
            model = genai.GenerativeModel(MODEL_NAME)
            ai_text = model.generate_content(message).text
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI error: {e}")

        supabase.table("user_chat_messages").insert({
            "user_id": user_id, "role": "assistant", "content": ai_text,
        }).execute()

        return {"response": ai_text}

    @staticmethod
    def get_history(user_id: str) -> list:
        result = (
            supabase.table("user_chat_messages")
            .select("id, role, content, created_at")
            .eq("user_id", user_id)
            .order("created_at")
            .execute()
        )
        return result.data or []


# ── Resources ─────────────────────────────────────────────────────────────────

class ResourceService:
    @staticmethod
    def _save(user_id: str, type_: str, topic: str, data: dict) -> dict:
        supabase.table("user_resources").insert({
            "user_id": user_id, "type": type_, "topic": topic, "data": data,
        }).execute()
        return {"type": type_, "topic": topic, **data}

    @staticmethod
    def youtube(user_id: str, topic: str) -> dict:
        result = generate_youtube_content(topic)
        return ResourceService._save(user_id, "youtube", topic, result)

    @staticmethod
    def articles(user_id: str, topic: str) -> dict:
        result = fetch_article_links(topic)
        data = result if isinstance(result, dict) else {"articles": result}
        return ResourceService._save(user_id, "article", topic, data)

    @staticmethod
    def get(user_id: str, type_: Optional[str] = None) -> list:
        q = (
            supabase.table("user_resources")
            .select("id, type, topic, data, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
        )
        if type_:
            q = q.eq("type", type_)
        return q.execute().data or []


# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  ROUTES                                                                     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/users/", summary="Sign up")
def create_user(user: UserCreate):
    return UserService.create_user(user)


@app.get("/users/{user_id}", summary="Get user profile")
def get_user(user_id: str):
    return UserService.get_user(user_id)


@app.post("/login", summary="Login → JWT")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        auth_resp = supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Login failed: {e}")

    if not auth_resp.user or not auth_resp.session:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {
        "msg": "Login successful",
        "user_id": auth_resp.user.id,
        "email": auth_resp.user.email,
        "access_token": auth_resp.session.access_token,
        "token_type": "bearer",
    }


# ── Onboarding ────────────────────────────────────────────────────────────────

@app.put("/users/{user_id}/onboarding", summary="Save location, language")
def update_onboarding(user_id: str, data: OnboardingUpdate):
    result = supabase.table("users").update({
        "language": data.language,
        "skills": data.skills,
        "street_address": data.street_address,
        "city": data.city,
        "state": data.state,
        "zip_code": data.zip_code,
        "country": data.country,
    }).eq("id", user_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"msg": "Onboarding saved"}


# ── Skills ────────────────────────────────────────────────────────────────────

@app.post("/users/{user_id}/skills/suggest",
          summary="AI-suggest skills from interest text (not saved)")
def suggest_skills(user_id: str, req: SkillSuggestRequest):
    skills = SkillService.suggest(req.interest)
    return {"skills": skills}


@app.put("/users/{user_id}/skills",
         summary="Save confirmed skills to user profile")
def save_skills(user_id: str, req: SkillsSaveRequest):
    return SkillService.save(user_id, req.skills)


# ── Roadmap ───────────────────────────────────────────────────────────────────

@app.post("/users/{user_id}/roadmap",
          summary="Generate + save a learning roadmap for a skill")
def generate_roadmap(user_id: str, req: RoadmapRequest):
    return RoadmapService.generate(user_id, req.skill)


@app.get("/users/{user_id}/roadmap",
         summary="Get all saved roadmaps")
def get_roadmaps(user_id: str):
    return RoadmapService.get_all(user_id)


@app.get("/users/{user_id}/roadmap/{skill}",
         summary="Get the latest roadmap for a specific skill")
def get_roadmap_by_skill(user_id: str, skill: str):
    return RoadmapService.get_by_skill(user_id, skill)


# ── Chat ──────────────────────────────────────────────────────────────────────

@app.post("/users/{user_id}/chat",
          summary="Send message → AI reply → both persisted in DB")
def chat(user_id: str, req: ChatRequest):
    return ChatService.send(user_id, req.message)


@app.get("/users/{user_id}/chat",
         summary="Get full chat history")
def get_chat_history(user_id: str):
    return ChatService.get_history(user_id)


# ── Resources ─────────────────────────────────────────────────────────────────

@app.post("/users/{user_id}/resources/youtube",
          summary="Fetch + save YouTube videos for a topic")
def get_youtube(user_id: str, req: ResourceRequest):
    try:
        return ResourceService.youtube(user_id, req.topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/users/{user_id}/resources/articles",
          summary="Fetch + save article links for a topic")
def get_articles(user_id: str, req: ResourceRequest):
    try:
        return ResourceService.articles(user_id, req.topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users/{user_id}/resources",
         summary="Get saved resources (?type=youtube|article|certificate)")
def get_resources(user_id: str, type: Optional[str] = None):
    return ResourceService.get(user_id, type)


# ── Certificate ───────────────────────────────────────────────────────────────

@app.post("/certificate/{user_id}",
          summary="Generate certificate PNG → upload to Supabase Storage")
def certificate_endpoint(user_id: str):
    user_data = UserService.get_user(user_id)
    name = user_data.get("first_name")
    if not name:
        raise HTTPException(status_code=400, detail="User has no first_name")

    file_name, file_bytes = generate_certificate(name)
    storage_path = f"{user_id}/{file_name}"

    supabase.storage.from_("certificates").upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": "image/png", "upsert": "true"},
    )

    public_url = supabase.storage.from_("certificates").get_public_url(storage_path)

    # Save as a certificate resource so it appears in GET /users/{id}/resources
    ResourceService._save(user_id, "certificate", name, {"url": public_url})

    return {"msg": "Certificate generated", "url": public_url}

