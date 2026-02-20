from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from supabase import create_client, Client
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from model import *
from utils import *
from config import *

# ── Environment ───────────────────────────────────────────────────────────────
load_dotenv()

# ── Supabase client (service-role key → bypasses RLS) ─────────────────────────
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ── Gemini ────────────────────────────────────────────────────────────────────
genai.configure(api_key=MODEL_API_KEY)

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(title="SkillBridge API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic request models ───────────────────────────────────────────────────
class SkillSuggestionRequest(BaseModel):
    prompt: str

class OnboardingUpdate(BaseModel):
    language: str
    skills: List[str]
    street_address: str
    city: str
    state: str
    zip_code: str
    country: str

# ── Services ──────────────────────────────────────────────────────────────────

class UserService:
    @staticmethod
    def get_user(user_id: str) -> dict:
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        return result.data[0]

    @staticmethod
    def create_user(user: UserCreate) -> dict:
        # 1. Register via Supabase Auth (creates auth.users row + issues JWT)
        try:
            auth_resp = supabase.auth.sign_up({
                "email": user.email,
                "password": user.password,
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Auth sign-up failed: {e}")

        if not auth_resp.user:
            raise HTTPException(status_code=400, detail="Auth sign-up returned no user")

        auth_uid = auth_resp.user.id  # Supabase UUID

        # 2. Check for duplicate profile (edge case: auth existed but profile row missing)
        existing = supabase.table("users").select("id").eq("email", user.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="User already exists")

        # 3. Insert public profile row
        profile = {
            "id": auth_uid,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name or "",
            "phone_number": user.phone_number or "",
            "terms_and_conditions": user.terms_and_conditions,
            "street_address": "",
            "city": "",
            "state": "",
            "zip_code": "",
            "country": "",
            "language": "",
            "skills": [],
        }
        supabase.table("users").insert(profile).execute()

        # Return token if Supabase Auth issued one (email confirmation disabled)
        access_token = None
        if auth_resp.session:
            access_token = auth_resp.session.access_token

        return {"msg": "User created", "id": auth_uid, "access_token": access_token}


class PromptService:
    @staticmethod
    def add_prompt(user_id: str, prompt: str) -> dict:
        supabase.table("user_prompts").insert({"user_id": user_id, "prompt": prompt}).execute()
        return {"msg": "Prompt added"}

    @staticmethod
    def get_prompts(user_id: str) -> dict:
        result = (
            supabase.table("user_prompts")
            .select("prompt")
            .eq("user_id", user_id)
            .order("created_at")
            .execute()
        )
        prompts = [row["prompt"] for row in (result.data or [])]
        return {"id": user_id, "prompts": prompts}


class OutputService:
    @staticmethod
    def add_output(user_id: str, output: str) -> dict:
        supabase.table("user_outputs").insert({"user_id": user_id, "output": output}).execute()
        return {"msg": "Output added"}

    @staticmethod
    def get_outputs(user_id: str) -> dict:
        result = (
            supabase.table("user_outputs")
            .select("output")
            .eq("user_id", user_id)
            .order("created_at")
            .execute()
        )
        outputs = [row["output"] for row in (result.data or [])]
        return {"id": user_id, "outputs": outputs}


# ── Routes: Users ─────────────────────────────────────────────────────────────

@app.post("/users/")
def create_user(user: UserCreate):
    return UserService.create_user(user)

@app.get("/users/{user_id}")
def get_user(user_id: str):
    return UserService.get_user(user_id)


# ── Routes: Prompts ───────────────────────────────────────────────────────────

@app.post("/prompts/{user_id}")
def add_prompt(user_id: str, prompt: str):
    return PromptService.add_prompt(user_id, prompt)

@app.get("/prompts/{user_id}")
def get_prompts(user_id: str):
    return PromptService.get_prompts(user_id)


# ── Routes: Outputs ───────────────────────────────────────────────────────────

@app.post("/outputs/{user_id}")
def add_output(user_id: str, output: str):
    return OutputService.add_output(user_id, output)

@app.get("/outputs/{user_id}")
def get_outputs(user_id: str):
    return OutputService.get_outputs(user_id)


# ── Route: Login ──────────────────────────────────────────────────────────────
# Calls Supabase Auth sign_in → returns JWT access_token + user_id

@app.post("/login")
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


# ── Route: Onboarding ─────────────────────────────────────────────────────────

@app.put("/users/{user_id}/onboarding")
def update_user_onboarding(user_id: str, data: OnboardingUpdate):
    result = (
        supabase.table("users")
        .update({
            "language": data.language,
            "skills": data.skills,
            "street_address": data.street_address,
            "city": data.city,
            "state": data.state,
            "zip_code": data.zip_code,
            "country": data.country,
        })
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"msg": "User onboarding updated"}


# ── Route: Certificate ────────────────────────────────────────────────────────
# Generates PNG, uploads to Supabase Storage, returns public URL

@app.post("/certificate/{user_id}")
def certificate_endpoint(user_id: str):
    user_data = UserService.get_user(user_id)
    name = user_data.get("first_name")
    if not name:
        raise HTTPException(status_code=400, detail="User does not have a first_name")

    file_name, file_bytes = generate_certificate(name)
    storage_path = f"{user_id}/{file_name}"

    # Upload (upsert so re-runs don't error)
    supabase.storage.from_("certificates").upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": "image/png", "upsert": "true"},
    )

    public_url = supabase.storage.from_("certificates").get_public_url(storage_path)
    OutputService.add_output(user_id, public_url)

    return {"msg": "Certificate generated", "file": public_url}


# ── AI Routes (FastAPI + Gemini) ──────────────────────────────────────────────

@app.post("/api/chat")
def chat_endpoint(payload: dict):
    """General conversational AI (used by ChatContainer)."""
    prompt = payload.get("prompt", "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate_content")
def generate_content_endpoint(payload: dict):
    """Generates a structured learning path (JSON) using BASE_PROMPT."""
    prompt = payload.get("prompt", "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(contents=BASE_PROMPT + prompt)
        response_text = response.text[7:-3]  # strip ```json / ``` fence
        return json.loads(response_text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse Gemini response as JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate_youtube_content")
def get_youtube_links(prompt: str):
    """Fetches relevant YouTube videos and wraps them with a Gemini-generated title."""
    if not prompt:
        return {"error": "Prompt is required"}
    try:
        return generate_youtube_content(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate_article")
def generate_article(prompt: str):
    """Fetches article links for a given topic via Gemini."""
    if not prompt.strip():
        return {"error": "Prompt is required"}
    try:
        return fetch_article_links(prompt)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse Gemini response as JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/suggest_skills")
def suggest_skills(req: SkillSuggestionRequest):
    """Returns a list of suggested skills based on a user interest prompt."""
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(
            f"Based on the user's interest: '{prompt}', suggest 5-10 relevant digital skills. "
            "Respond only with a comma-separated list."
        )
        skills = [s.strip() for s in response.text.split(",") if s.strip()]
        return {"skills": skills}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
