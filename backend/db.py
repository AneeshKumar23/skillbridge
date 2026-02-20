"""
SQLAlchemy models — used by Alembic for migrations.
FastAPI routes still use the supabase-py client for runtime queries.
"""

from sqlalchemy import (
    Column, String, Boolean, Text, BigInteger, TIMESTAMP, ARRAY,
    ForeignKey, func
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id             = Column(String,  primary_key=True)   # Supabase Auth UUID
    email          = Column(String,  unique=True, nullable=False)
    first_name     = Column(String,  nullable=False, default="")
    last_name      = Column(String,  default="")
    phone_number   = Column(String,  default="")
    terms_and_conditions = Column(Boolean, default=False)
    street_address = Column(String,  default="")
    city           = Column(String,  default="")
    state          = Column(String,  default="")
    zip_code       = Column(String,  default="")
    country        = Column(String,  default="")
    language       = Column(String,  default="")
    skills         = Column(ARRAY(Text), default=[])
    created_at     = Column(TIMESTAMP(timezone=True), server_default=func.now())


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
