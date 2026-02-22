from pydantic import BaseModel, EmailStr
from typing import Optional, List


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = ""
    email: EmailStr
    phone_number: str
    password: str
    terms_and_conditions: bool
    street_address: str = ""
    city: str = ""
    state: str = ""
    zip_code: str = ""
    country: str = ""
    language: Optional[str] = ""
    skills: Optional[List[str]] = []

class UserInDB(UserCreate):
    id: str


# ── Onboarding ────────────────────────────────────────────────────────────────

class OnboardingUpdate(BaseModel):
    language: str
    skills: List[str]
    street_address: str
    city: str
    state: str
    zip_code: str
    country: str


# ── Skills ────────────────────────────────────────────────────────────────────

class SkillSuggestRequest(BaseModel):
    """Body for POST /users/{id}/skills/suggest — free-text interest."""
    interest: str

class SkillsSaveRequest(BaseModel):
    """Body for PUT /users/{id}/skills — confirmed skill list from frontend."""
    skills: List[str]

class SkillStatusUpdate(BaseModel):
    """Body for PATCH /users/{id}/skills/{skill} — update a skill's status."""
    status: str  # 'active' | 'completed' | 'paused'


# ── Roadmap ───────────────────────────────────────────────────────────────────

class RoadmapRequest(BaseModel):
    """Body for POST /users/{id}/roadmap."""
    skill: str


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    """Body for POST /users/{id}/chat."""
    message: str


# ── Resources ─────────────────────────────────────────────────────────────────

class ResourceRequest(BaseModel):
    """Body for POST /users/{id}/resources/youtube and /articles."""
    topic: str
# ── Rooms ────────────────────────────────────────────────────────────────────

class RoomMessageRequest(BaseModel):
    """Body for POST /rooms/{room_id}/messages."""
    username: str
    content: str
