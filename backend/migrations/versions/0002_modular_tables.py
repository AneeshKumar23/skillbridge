"""Add user_chat_messages, user_roadmaps, user_resources tables

Revision ID: 0002_modular_tables
Revises: 0001_initial
Create Date: 2026-02-20
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0002_modular_tables'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── user_chat_messages ────────────────────────────────────────────────────
    # Replaces user_prompts with a proper conversation log (user + assistant).
    op.create_table(
        'user_chat_messages',
        sa.Column('id',         sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id',    sa.String(),     sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role',       sa.Text(),       nullable=False),   # 'user' | 'assistant'
        sa.Column('content',    sa.Text(),       nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )
    op.create_check_constraint('ck_chat_role', 'user_chat_messages', "role IN ('user', 'assistant')")

    # ── user_roadmaps ─────────────────────────────────────────────────────────
    # One row per (user, skill) — stores the full generate_content JSON.
    op.create_table(
        'user_roadmaps',
        sa.Column('id',         sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id',    sa.String(),     sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill',      sa.Text(),       nullable=False),
        sa.Column('roadmap',    postgresql.JSONB(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )

    # ── user_resources ────────────────────────────────────────────────────────
    # YouTube videos, articles, or certificate URLs — differentiated by type.
    op.create_table(
        'user_resources',
        sa.Column('id',         sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id',    sa.String(),     sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type',       sa.Text(),       nullable=False),   # 'youtube' | 'article' | 'certificate'
        sa.Column('topic',      sa.Text(),       nullable=False),
        sa.Column('data',       postgresql.JSONB(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )
    op.create_check_constraint('ck_resource_type', 'user_resources', "type IN ('youtube', 'article', 'certificate')")

    # ── Enable RLS ────────────────────────────────────────────────────────────
    op.execute("ALTER TABLE user_chat_messages ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE user_roadmaps      ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE user_resources     ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table('user_resources')
    op.drop_table('user_roadmaps')
    op.drop_table('user_chat_messages')
