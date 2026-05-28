from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from supabase import create_client, Client
import google.generativeai as genai
import json
import re
import datetime
import time
import os
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
    """Robustly extract and parse JSON from Gemini output."""
    text = text.strip()
    
    # Strip Markdown fences if present
    text = re.sub(r'^```[a-zA-Z]*\n?', '', text)
    text = re.sub(r'\n?```$', '', text)
    text = text.strip()

    try:
        # Try direct parse first
        return json.loads(text)
    except json.JSONDecodeError:
        # If that fails, try to find the first '{' and last '}'
        try:
            start = text.index('{')
            end = text.rindex('}') + 1
            json_str = text[start:end]
            return json.loads(json_str)
        except (ValueError, json.JSONDecodeError) as e:
            print(f"Failed to parse Gemini JSON. Raw text: {text}")
            raise HTTPException(
                status_code=500, 
                detail=f"Gemini returned invalid JSON: {str(e)}"
            )


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
            f"The user wants to learn about: '{interest}'.\n"
            "Suggest 5-10 practical skills that are DIRECTLY relevant to that specific topic or domain.\n"
            "Do NOT suggest generic digital marketing, social media, or online business skills unless the interest is specifically about those.\n"
            "Match the skill suggestions closely to the domain of the interest (e.g., if it's tailoring → suggest pattern making, hand stitching, fabric selection, etc.).\n"
            "Respond ONLY with a comma-separated list of skill names. No explanations, no numbering, no extra text."
        )
        return [s.strip() for s in response.text.split(",") if s.strip()]

    @staticmethod
    def save(user_id: str, skills: List[str]) -> dict:
        """Insert a skills-snapshot row (full list) into user_skills, then sync users.skills."""
        new_values = list(set(skills))  # deduplicate
        
        # Get latest language to include in the snapshot
        latest = supabase.table("user_skills").select("language").eq("user_id", user_id).not_.is_("language", "null").order("created_at", desc=True).limit(1).execute()
        lang = latest.data[0]["language"] if latest.data else None

        supabase.table("user_skills").insert({
            "user_id": user_id,
            "skills": new_values,
            "language": lang,
            "status": "active",
        }).execute()
        # Keep users.skills in sync for backward compat
        supabase.table("users").update({"skills": new_values}).eq("id", user_id).execute()
        # Auto-create a chat room for every skill (idempotent)
        for skill in new_values:
            RoomService.ensure_room(skill)
        return {"msg": "Skills saved", "skills": new_values}

    @staticmethod
    def get_history(user_id: str) -> list:
        """Return all skill-snapshot rows for the user, filtering out duplicates where skills didn't change."""
        result = (
            supabase.table("user_skills")
            .select("id, skills, status, created_at")
            .eq("user_id", user_id)
            .not_.is_("skills", "null")
            .order("created_at")
            .execute()
        )
        rows = result.data or []
        # Filter out rows where skills are identical to the previous row
        filtered = []
        prev_skills = None
        for r in rows:
            curr_skills = sorted(r["skills"]) if r.get("skills") else []
            if curr_skills != prev_skills:
                filtered.append(r)
                prev_skills = curr_skills
        return filtered

    @staticmethod
    def update_status(user_id: str, skill: str, status: str) -> dict:
        """Update status for a single skill.

        If the skill shares a snapshot row with others, it is extracted into
        its own row so the sibling skills are not affected.
        """
        valid = {"active", "completed", "paused"}
        if status not in valid:
            raise HTTPException(status_code=400, detail=f"status must be one of {valid}")

        # Find the latest snapshot row containing this skill
        rows = (
            supabase.table("user_skills")
            .select("id, skills, status, created_at")
            .eq("user_id", user_id)
            .not_.is_("skills", "null")
            .order("created_at", desc=True)
            .execute()
        ).data or []

        target_row = next(
            (r for r in rows if r.get("skills") and skill in r["skills"]), None
        )
        if target_row is None:
            raise HTTPException(status_code=404, detail=f"Skill '{skill}' not found")

        siblings = [s for s in target_row["skills"] if s != skill]

        if siblings:
            # Remove this skill from the shared row (siblings keep their status)
            supabase.table("user_skills").update({"skills": siblings}).eq("id", target_row["id"]).execute()
            # Insert a new individual row for this skill with the new status
            supabase.table("user_skills").insert({
                "user_id": user_id,
                "skills": [skill],
                "status": status,
                "created_at": target_row["created_at"],   # preserve original date
            }).execute()
        else:
            # Already alone in its row — just update status in-place
            supabase.table("user_skills").update({"status": status}).eq("id", target_row["id"]).execute()

        return {"msg": "Status updated", "skill": skill, "status": status}


# ── Language ──────────────────────────────────────────────────────────────────

class LanguageService:
    @staticmethod
    def save(user_id: str, language: str) -> dict:
        """Append a language-change row to user_skills and sync users.language."""
        # Get latest skills to include in the snapshot
        latest = supabase.table("user_skills").select("skills").eq("user_id", user_id).not_.is_("skills", "null").order("created_at", desc=True).limit(1).execute()
        skills = latest.data[0]["skills"] if latest.data else []

        supabase.table("user_skills").insert({
            "user_id": user_id,
            "skills": skills,
            "language": language,
            "status": "active",
        }).execute()
        supabase.table("users").update({"language": language}).eq("id", user_id).execute()
        return {"msg": "Language saved", "language": language}

    @staticmethod
    def get_history(user_id: str) -> list:
        """Return all language-change rows for the user, filtering out duplicates."""
        result = (
            supabase.table("user_skills")
            .select("id, language, created_at")
            .eq("user_id", user_id)
            .not_.is_("language", "null")
            .order("created_at")
            .execute()
        )
        rows = result.data or []
        # Filter out rows where language is identical to the previous row
        filtered = []
        prev_lang = None
        for r in rows:
            curr_lang = r.get("language")
            if curr_lang != prev_lang:
                filtered.append(r)
                prev_lang = curr_lang
        return filtered


# ── Rooms ────────────────────────────────────────────────────────────────────

class RoomService:
    CATEGORIES = [
        "Programming", "Web Development", "Backend & APIs", "AI & Machine Learning",
        "Crafts & Fashion", "Agriculture", "Music & Arts", "Trade Skills",
        "Health & Wellness", "Science", "Business", "Sports", "Language Learning",
        "Design", "Other"
    ]

    @staticmethod
    def _categorise(skill: str) -> str:
        """Ask Gemini to assign a single category to a skill."""
        try:
            cats = ", ".join(RoomService.CATEGORIES)
            model = genai.GenerativeModel(MODEL_NAME)
            resp = model.generate_content(
                f"Which single category best describes the skill '{skill}'?\n"
                f"Categories: {cats}\n"
                f"Reply with ONLY the category name, nothing else."
            )
            answer = resp.text.strip().strip('"').strip("'")
            # Validate — if Gemini hallucinates, fall back to Other
            return answer if answer in RoomService.CATEGORIES else "Other"
        except Exception:
            return "Other"

    @staticmethod
    def ensure_room(skill: str) -> dict:
        """Create a room for `skill` if one doesn't exist yet."""
        key = skill.lower().strip()
        existing = supabase.table("rooms").select("id, skill, category").eq("skill", key).execute()
        if existing.data:
            return existing.data[0]
        category = RoomService._categorise(skill)
        description = f"Community chat room for {skill}"
        result = supabase.table("rooms").insert({
            "skill": key,
            "category": category,
            "description": description,
        }).execute()
        return result.data[0] if result.data else {}

    @staticmethod
    def list_rooms() -> list:
        """Return all rooms ordered by category then skill name."""
        result = supabase.table("rooms").select("*").order("category").order("skill").execute()
        return result.data or []

    @staticmethod
    def get_messages(room_id: int, limit: int = 50) -> list:
        result = (
            supabase.table("room_messages")
            .select("*")
            .eq("room_id", room_id)
            .order("created_at", desc=False)
            .limit(limit)
            .execute()
        )
        return result.data or []

    @staticmethod
    def post_message(room_id: int, user_id: str, username: str, content: str) -> dict:
        result = supabase.table("room_messages").insert({
            "room_id": room_id,
            "user_id": user_id,
            "username": username,
            "content": content,
        }).execute()
        return result.data[0] if result.data else {}


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

    @staticmethod
    def update(user_id: str, skill: str, roadmap: dict) -> dict:
        supabase.table("user_roadmaps").update({"roadmap": roadmap}).eq("user_id", user_id).eq("skill", skill).execute()
        return {"skill": skill, "roadmap": roadmap}


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatService:
    @staticmethod
    def send(user_id: str, message: str) -> dict:
        """Save user message → call Gemini → save reply → return response."""
        
        # Get embedding for user message
        try:
            msg_embed_resp = genai.embed_content(
                model="models/gemini-embedding-001", 
                content=message
            )
            msg_embedding = msg_embed_resp['embedding']
        except Exception:
            msg_embedding = None

        supabase.table("user_chat_messages").insert({
            "user_id": user_id, "role": "user", "content": message, "embedding": msg_embedding
        }).execute()

        try:
            model = genai.GenerativeModel(MODEL_NAME)
            ai_text = model.generate_content(message).text
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI error: {e}")

        # Get embedding for AI response
        try:
            ai_embed_resp = genai.embed_content(
                model="models/gemini-embedding-001", 
                content=ai_text
            )
            ai_embedding = ai_embed_resp['embedding']
        except Exception:
            ai_embedding = None

        supabase.table("user_chat_messages").insert({
            "user_id": user_id, "role": "assistant", "content": ai_text, "embedding": ai_embedding
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


# ── Questions ─────────────────────────────────────────────────────────────────

class QuestionService:
    @staticmethod
    def generate_questions(user_id: str, topic: str, num_questions: int, language: str = "English") -> dict:
        # mapping for common language codes to full names if needed
        lang_map = {
            "en": "English",
            "hi": "Hindi",
            "ta": "Tamil",
            "te": "Telugu",
            "bn": "Bengali"
        }
        full_language = lang_map.get(language.lower(), language)

        # 1. Embed the topic
        try:
            topic_embed_resp = genai.embed_content(
                model="models/gemini-embedding-001", 
                content=topic
            )
            topic_embedding = topic_embed_resp['embedding']
        except Exception as e:
            print(f"Failed to embed topic: {e}")
            topic_embedding = None

        # 2. Fetch past chat messages/materials for the user to find context
        context_text = ""
        if topic_embedding:
            result = (
                supabase.table("user_chat_messages")
                .select("content, embedding")
                .eq("user_id", user_id)
                .not_.is_("embedding", "null")
                .order("created_at", desc=True)
                .limit(100)
                .execute()
            )
            
            # 3. Compute similarity and pick top K
            import math
            
            def cosine_similarity(v1, v2):
                if not v1 or not v2 or len(v1) != len(v2):
                    return 0.0
                dot = sum(a*b for a, b in zip(v1, v2))
                norm1 = math.sqrt(sum(a*a for a in v1))
                norm2 = math.sqrt(sum(b*b for b in v2))
                return dot / (norm1 * norm2) if norm1 and norm2 else 0.0

            scored_msgs = []
            for row in result.data or []:
                emb = row.get("embedding")
                if emb:
                    if isinstance(emb, str):
                        try: emb = json.loads(emb)
                        except: continue
                    score = cosine_similarity(topic_embedding, emb)
                    scored_msgs.append((score, row["content"]))
                    
            scored_msgs.sort(key=lambda x: x[0], reverse=True)
            top_k = [msg for score, msg in scored_msgs[:5]]
            context_text = "\n\n".join(top_k) if top_k else ""

        # 4. Generate questions using Gemini
        prompt = f"""
You are an educational assistant. 
Generate {num_questions} multiple-choice questions about the topic "{topic}".
The questions, options, and answers MUST be in the {full_language} language.

{'Context from user history:' if context_text else ''}
{context_text}

Generate ONLY a JSON array of objects with the following format, with no extra markdown or text:
[
  {{
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "..."
  }}
]
"""
        try:
            model = genai.GenerativeModel(MODEL_NAME)
            response = model.generate_content(prompt)
            data = _parse_gemini_json(response.text)
            return {"topic": topic, "questions": data[:num_questions]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate questions: {e}")


# ── Certificate Service ───────────────────────────────────────────────────────

class CertificateService:
    @staticmethod
    def generate_id() -> str:
        import datetime
        current_year = datetime.datetime.now().year
        # Count all certificates to get a sequence number
        res = supabase.table("user_certificates").select("id", count="exact").execute()
        count = len(res.data) if res.data else 0
        sequence = count + 1
        return f"SB-{current_year}-{sequence:04d}"

    @staticmethod
    def get_by_user(user_id: str) -> list:
        result = supabase.table("user_certificates").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data or []

    @staticmethod
    def get_by_id(cert_id: str) -> dict:
        result = supabase.table("user_certificates").select("*").eq("id", cert_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Certificate not found")
        return result.data[0]

    @staticmethod
    def register_on_chain_background(
        cert_id: str,
        cert_hash: str,
        student_name: str,
        skill: str,
        issued_at_timestamp: int
    ):
        import time
        import os
        import hashlib
        try:
            print(f"Background task started: registering {cert_id} on Polygon...")
            rpc_url = os.getenv("POLYGON_RPC_URL")
            contract_address = os.getenv("CONTRACT_ADDRESS")
            private_key = os.getenv("CONTRACT_DEPLOYER_PRIVATE_KEY") or os.getenv("PRIVATE_KEY")
            
            # Check if we should fallback to mock (if config is missing or placeholder)
            if not rpc_url or not contract_address or not private_key or "your_metamask" in private_key or "deployed" in contract_address:
                print("WARNING: Polygon configuration missing or using placeholder values in .env. Mocking blockchain registration...")
                time.sleep(3) # simulate transaction confirmation delay
                fake_tx_hash = f"0x{hashlib.sha256(cert_id.encode()).hexdigest()}"
                supabase.table("user_certificates").update({
                    "tx_hash": fake_tx_hash,
                    "explorer_url": f"https://amoy.polygonscan.com/tx/{fake_tx_hash}",
                    "contract_address": contract_address or "0xMockContractAddress1234567890abcdef12345",
                    "chain_id": 80002,
                    "network": "polygon-amoy",
                    "verification_status": "verified"
                }).eq("id", cert_id).execute()
                print(f"Certificate {cert_id} registered on mock Polygon successfully.")
                return

            # Real blockchain execution
            from blockchain.interactor import register_certificate_on_blockchain, get_web3_and_contract
            tx_hash = register_certificate_on_blockchain(
                certificate_id=cert_id,
                cert_hash=cert_hash,
                student_name=student_name,
                skill=skill,
                issued_at=issued_at_timestamp
            )
            print(f"Transaction sent: {tx_hash}. Waiting for confirmation...")
            
            w3, _ = get_web3_and_contract()
            tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if tx_receipt.status == 1:
                explorer_url = f"https://amoy.polygonscan.com/tx/{tx_hash}"
                
                # Update DB to verified
                supabase.table("user_certificates").update({
                    "tx_hash": tx_hash,
                    "explorer_url": explorer_url,
                    "contract_address": contract_address,
                    "chain_id": int(os.getenv("CHAIN_ID", "80002")),
                    "network": os.getenv("NETWORK", "polygon-amoy"),
                    "verification_status": "verified"
                }).eq("id", cert_id).execute()
                print(f"Certificate {cert_id} verified on-chain in block {tx_receipt.blockNumber}")
            else:
                raise Exception("Transaction reverted")
        except Exception as e:
            print(f"Error registering certificate {cert_id} on-chain: {e}")
            supabase.table("user_certificates").update({
                "verification_status": "failed"
            }).eq("id", cert_id).execute()


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
    # Update location fields on users table
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

    # Also write to history tables
    if data.language:
        LanguageService.save(user_id, data.language)
    if data.skills:
        SkillService.save(user_id, data.skills)

    return {"msg": "Onboarding saved"}


# ── Skills ────────────────────────────────────────────────────────────────────

@app.post("/users/{user_id}/skills/suggest",
          summary="AI-suggest skills from interest text (not saved)")
def suggest_skills(user_id: str, req: SkillSuggestRequest):
    skills = SkillService.suggest(req.interest)
    return {"skills": skills}


@app.put("/users/{user_id}/skills",
         summary="Save confirmed skills to user_skills table")
def save_skills(user_id: str, req: SkillsSaveRequest):
    return SkillService.save(user_id, req.skills)


@app.get("/users/{user_id}/skills",
         summary="Get skill history with status and timestamps")
def get_skill_history(user_id: str):
    return SkillService.get_history(user_id)


@app.patch("/users/{user_id}/skills/{skill}",
           summary="Update status of a skill (active | completed | paused)")
def update_skill_status(user_id: str, skill: str, req: SkillStatusUpdate):
    return SkillService.update_status(user_id, skill, req.status)


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


@app.patch("/users/{user_id}/roadmap/{skill}",
           summary="Update a saved roadmap JSON")
def update_roadmap(user_id: str, skill: str, req: RoadmapUpdateRequest):
    return RoadmapService.update(user_id, skill, req.roadmap)


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


# ── Languages ─────────────────────────────────────────────────────────────────

@app.get("/users/{user_id}/languages",
         summary="Get language history with timestamps")
def get_language_history(user_id: str):
    return LanguageService.get_history(user_id)


# ── Certificate ───────────────────────────────────────────────────────────────

@app.post("/users/{user_id}/certificates/generate",
          summary="Generate certificate PNG → upload to Supabase Storage → publish to Polygon")
def generate_user_certificate(user_id: str, req: CertificateGenerateRequest, background_tasks: BackgroundTasks):
    # 1. Fetch user data to verify existence and name
    user_data = UserService.get_user(user_id)
    name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
    if not name:
        raise HTTPException(status_code=400, detail="User has no name configured")

    # 2. Check if certificate is already generated for this skill to prevent double issuance
    existing = supabase.table("user_certificates").select("id").eq("user_id", user_id).eq("skill", req.skill).execute()
    if existing.data:
        # Return existing certificate details
        res_full = supabase.table("user_certificates").select("*").eq("id", existing.data[0]["id"]).execute()
        return {
            "msg": "Certificate already generated for this skill",
            "certificate": res_full.data[0]
        }

    # 3. Generate certificate ID
    cert_id = CertificateService.generate_id()
    date_str = datetime.date.today().strftime("%B %d, %Y")
    issued_at_ts = int(time.time())

    # 4. Generate Certificate Image with QR Code
    try:
        file_name, file_bytes, cert_hash = generate_certificate(
            name=name,
            skill=req.skill,
            certificate_id=cert_id,
            date_str=date_str
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to render certificate image: {e}")

    # 5. Upload to Supabase Storage
    # Bucket name: certificates
    storage_path = f"{user_id}/{file_name}"
    try:
        supabase.storage.from_("certificates").upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": "image/png", "upsert": "true"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to storage: {e}")

    public_url = supabase.storage.from_("certificates").get_public_url(storage_path)

    # 6. Insert pending certificate row into database
    cert_record = {
        "id": cert_id,
        "user_id": user_id,
        "skill": req.skill,
        "cert_hash": cert_hash,
        "verification_status": "pending",
        "image_url": public_url,
        "contract_address": os.getenv("CONTRACT_ADDRESS"),
        "chain_id": int(os.getenv("CHAIN_ID", "80002")),
        "network": os.getenv("NETWORK", "polygon-amoy")
    }
    
    supabase.table("user_certificates").insert(cert_record).execute()

    # 7. Queue blockchain registration in background task
    background_tasks.add_task(
        CertificateService.register_on_chain_background,
        cert_id=cert_id,
        cert_hash=cert_hash,
        student_name=name,
        skill=req.skill,
        issued_at_timestamp=issued_at_ts
    )

    # Return immediate response
    return {
        "msg": "Certificate generation initiated",
        "certificate": {
            **cert_record,
            "verification_status": "pending"
        }
    }


@app.get("/certificates/{certificate_id}/verify",
         summary="Verify a certificate using both DB and Polygon contract validation")
def verify_certificate_endpoint(certificate_id: str):
    import time
    
    # 1. Look up DB record
    db_cert = CertificateService.get_by_id(certificate_id)
    
    # 2. Query blockchain if configured
    rpc_url = os.getenv("POLYGON_RPC_URL")
    contract_address = os.getenv("CONTRACT_ADDRESS")
    private_key = os.getenv("CONTRACT_DEPLOYER_PRIVATE_KEY") or os.getenv("PRIVATE_KEY")
    
    is_blockchain_valid = False
    blockchain_data = None
    
    if rpc_url and contract_address and private_key and "your_metamask" not in private_key and "deployed" not in contract_address:
        try:
            # Query contract directly
            blockchain_data = verify_certificate_on_blockchain(certificate_id)
            # Compare hash in contract with hash in DB to verify tampering
            is_blockchain_valid = blockchain_data.get("valid") and (blockchain_data.get("cert_hash") == db_cert.get("cert_hash"))
        except Exception as e:
            print(f"Failed to verify on blockchain: {e}")
            is_blockchain_valid = False
    else:
        # Mock mode fallback (if keys aren't set)
        print("Using DB validation fallback for verification (Polygon config not active)")
        is_blockchain_valid = db_cert.get("verification_status") == "verified"
        
        # Parse timestamp
        try:
            from datetime import datetime as dt
            parsed_dt = dt.fromisoformat(db_cert["created_at"].replace("Z", "+00:00"))
            issued_at_ts = int(parsed_dt.timestamp())
        except Exception:
            issued_at_ts = int(time.time())
            
        user_data = UserService.get_user(db_cert["user_id"])
        full_name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
        
        blockchain_data = {
            "valid": is_blockchain_valid,
            "cert_hash": db_cert.get("cert_hash") or "",
            "student_name": full_name,
            "skill": db_cert.get("skill", ""),
            "issued_at": issued_at_ts
        }
        
    return {
        "certificate_id": certificate_id,
        "is_verified": is_blockchain_valid,
        "db_record": db_cert,
        "blockchain_record": blockchain_data
    }


@app.get("/users/{user_id}/certificates",
         summary="List all certificates earned by a user")
def list_user_certificates(user_id: str):
    return CertificateService.get_by_user(user_id)


# ── Rooms ────────────────────────────────────────────────────────────────────

@app.get("/rooms", summary="List all skill chat rooms")
def list_rooms():
    return RoomService.list_rooms()

@app.get("/rooms/{room_id}/messages", summary="Get message history for a room")
def get_room_messages(room_id: int, limit: int = 50):
    return RoomService.get_messages(room_id, limit)

@app.post("/rooms/{room_id}/messages", summary="Post a message to a room")
def post_room_message(room_id: int, user_id: str, req: RoomMessageRequest):
    return RoomService.post_message(room_id, user_id, req.username, req.content)

@app.put("/rooms/messages/{message_id}", summary="Edit a room message")
def update_room_message(message_id: int, user_id: str, req: RoomMessageRequest):
    result = supabase.table("room_messages").update({
        "content": req.content
    }).eq("id", message_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Message not found or unauthorized")
    return result.data[0]

@app.delete("/rooms/messages/{message_id}", summary="Delete a room message")
def delete_room_message(message_id: int, user_id: str):
    result = supabase.table("room_messages").delete().eq("id", message_id).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Message not found or unauthorized")
    return {"msg": "Message deleted"}


# ── Questions ─────────────────────────────────────────────────────────────────

@app.post("/users/{user_id}/questions", summary="Generate questions using semantic search on embeddings")
def generate_questions(user_id: str, req: QuestionRequest):
    return QuestionService.generate_questions(user_id, req.topic, req.num_questions, req.language)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
