"""
SQLAlchemy models — used by Alembic for migrations only.
FastAPI routes use supabase-py for all runtime queries.
"""

from sqlalchemy import (
    Column, String, Boolean, Text, BigInteger, TIMESTAMP, ARRAY,
    ForeignKey, func
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id                   = Column(String,  primary_key=True)  # Supabase Auth UUID
    email                = Column(String,  unique=True, nullable=False)
    first_name           = Column(String,  nullable=False, server_default="")
    last_name            = Column(String,  server_default="")
    phone_number         = Column(String,  server_default="")
    terms_and_conditions = Column(Boolean, server_default="false")
    street_address       = Column(String,  server_default="")
    city                 = Column(String,  server_default="")
    state                = Column(String,  server_default="")
    zip_code             = Column(String,  server_default="")
    country              = Column(String,  server_default="")
    language             = Column(String,  server_default="")
    skills               = Column(ARRAY(Text), server_default="{}")
    created_at           = Column(TIMESTAMP(timezone=True), server_default=func.now())


# ── Legacy tables (kept for backward compat, no longer written to) ────────────

class UserPrompt(Base):
    __tablename__ = "user_prompts"

    id         = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id    = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    prompt     = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class UserOutput(Base):
    __tablename__ = "user_outputs"

    id         = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id    = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    output     = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


# ── Modular output tables ─────────────────────────────────────────────────────

class UserChatMessage(Base):
    """Full conversation history. role = 'user' | 'assistant'."""
    __tablename__ = "user_chat_messages"

    id         = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id    = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role       = Column(Text, nullable=False)   # 'user' | 'assistant'
    content    = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class UserRoadmap(Base):
    """AI-generated structured learning path per skill."""
    __tablename__ = "user_roadmaps"

    id         = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id    = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill      = Column(Text, nullable=False)
    roadmap    = Column(JSONB, nullable=False)   # full generate_content JSON
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class UserResource(Base):
    """Saved YouTube videos, articles, or certificate URLs per topic."""
    __tablename__ = "user_resources"

    id         = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id    = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type       = Column(Text, nullable=False)    # 'youtube' | 'article' | 'certificate'
    topic      = Column(Text, nullable=False)
    data       = Column(JSONB, nullable=False)   # {"videos":[...]} | {"articles":[...]} | {"url":"..."}
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


# ── User skills table (skills snapshot + language history) ───────────────────

class UserSkill(Base):
    """Unified table for skill and language history.

    Skill snapshot row : skills = ['python', 'react'], language = NULL
    Language change row: skills = NULL,                 language = 'English'
    """
    __tablename__ = "user_skills"

    id         = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id    = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skills     = Column(ARRAY(Text), nullable=True)   # array of skill names (skill rows)
    language   = Column(Text, nullable=True)          # language name (language rows)
    status     = Column(Text, nullable=True)          # 'active'|'completed'|'paused' (skills only)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
