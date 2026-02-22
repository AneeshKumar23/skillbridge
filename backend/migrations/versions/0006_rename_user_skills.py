"""Rename user_profile_items to user_skills; replace type+value cols with skills[]+language

Revision ID: 0006_rename_user_skills
Revises: 0005_merge_profile_items
Create Date: 2026-02-20
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Text

revision = '0006_rename_user_skills'
down_revision = '0005_merge_profile_items'
branch_labels = None
depends_on = None


def upgrade():
    # ── Create new table with updated schema ──────────────────────────────────
    op.create_table(
        'user_skills',
        sa.Column('id', sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('skills', ARRAY(Text), nullable=True),    # array of skill names
        sa.Column('language', sa.Text(), nullable=True),    # language preference
        sa.Column('status', sa.Text(), nullable=True),      # active|completed|paused (skills only)
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.CheckConstraint(
            "status IS NULL OR status IN ('active', 'completed', 'paused')",
            name='user_skills_status_check',
        ),
    )
    op.create_index('ix_user_skills_user_id', 'user_skills', ['user_id'])

    # ── Migrate data from user_profile_items ──────────────────────────────────
    # Skill rows: old type='skill', value=skill_name → skills=ARRAY[value], language=NULL
    op.execute("""
        INSERT INTO user_skills (user_id, skills, language, status, created_at)
        SELECT user_id, ARRAY[value], NULL, status, created_at
        FROM user_profile_items
        WHERE type = 'skill'
    """)

    # Language rows: old type='language', value=lang_name → language=value, skills=NULL
    op.execute("""
        INSERT INTO user_skills (user_id, skills, language, status, created_at)
        SELECT user_id, NULL, value, NULL, created_at
        FROM user_profile_items
        WHERE type = 'language'
    """)

    # ── Grants ────────────────────────────────────────────────────────────────
    for role in ['service_role', 'authenticated', 'anon']:
        op.execute(f"GRANT ALL ON TABLE user_skills TO {role};")
    op.execute(
        "GRANT USAGE, SELECT ON SEQUENCE user_skills_id_seq "
        "TO service_role, authenticated, anon;"
    )

    # ── RLS ───────────────────────────────────────────────────────────────────
    op.execute("ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY user_skills_own ON user_skills
        USING (user_id::text = auth.uid()::text)
        WITH CHECK (user_id::text = auth.uid()::text);
    """)

    # ── Drop old table ────────────────────────────────────────────────────────
    op.execute("DROP POLICY IF EXISTS profile_items_own ON user_profile_items;")
    op.drop_index('ix_profile_items_type',    table_name='user_profile_items')
    op.drop_index('ix_profile_items_user_id', table_name='user_profile_items')
    op.drop_table('user_profile_items')


def downgrade():
    op.create_table(
        'user_profile_items',
        sa.Column('id', sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('type', sa.Text(), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('status', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.execute("""
        INSERT INTO user_profile_items (user_id, type, value, status, created_at)
        SELECT user_id, 'skill', unnest(skills), status, created_at
        FROM user_skills WHERE skills IS NOT NULL
    """)
    op.execute("""
        INSERT INTO user_profile_items (user_id, type, value, status, created_at)
        SELECT user_id, 'language', language, NULL, created_at
        FROM user_skills WHERE language IS NOT NULL
    """)
    op.execute("DROP POLICY IF EXISTS user_skills_own ON user_skills;")
    op.drop_index('ix_user_skills_user_id', table_name='user_skills')
    op.drop_table('user_skills')
