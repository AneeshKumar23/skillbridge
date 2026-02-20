"""Merge user_skills and user_languages into user_profile_items

Revision ID: 0005_merge_profile_items
Revises: 0004_skills_language_tables
Create Date: 2026-02-20
"""
from alembic import op
import sqlalchemy as sa

revision = '0005_merge_profile_items'
down_revision = '0004_skills_language_tables'
branch_labels = None
depends_on = None


def upgrade():
    # ── Create unified table ──────────────────────────────────────────────────
    op.create_table(
        'user_profile_items',
        sa.Column('id', sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('type', sa.Text(), nullable=False),      # 'skill' | 'language'
        sa.Column('value', sa.Text(), nullable=False),     # the skill name or language name
        sa.Column('status', sa.Text(), nullable=True),     # 'active'|'completed'|'paused' (skills only)
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.CheckConstraint("type IN ('skill', 'language')", name='profile_items_type_check'),
        sa.CheckConstraint(
            "status IS NULL OR status IN ('active', 'completed', 'paused')",
            name='profile_items_status_check',
        ),
    )
    op.create_index('ix_profile_items_user_id', 'user_profile_items', ['user_id'])
    op.create_index('ix_profile_items_type',    'user_profile_items', ['user_id', 'type'])

    # ── Migrate existing data ─────────────────────────────────────────────────
    op.execute("""
        INSERT INTO user_profile_items (user_id, type, value, status, created_at)
        SELECT user_id, 'skill', skill, status, created_at
        FROM user_skills
    """)

    op.execute("""
        INSERT INTO user_profile_items (user_id, type, value, status, created_at)
        SELECT user_id, 'language', language, NULL, created_at
        FROM user_languages
    """)

    # ── Grants ────────────────────────────────────────────────────────────────
    for role in ['service_role', 'authenticated', 'anon']:
        op.execute(f"GRANT ALL ON TABLE user_profile_items TO {role};")
    op.execute(
        "GRANT USAGE, SELECT ON SEQUENCE user_profile_items_id_seq "
        "TO service_role, authenticated, anon;"
    )

    # ── RLS ───────────────────────────────────────────────────────────────────
    op.execute("ALTER TABLE user_profile_items ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY profile_items_own ON user_profile_items
        USING (user_id::text = auth.uid()::text)
        WITH CHECK (user_id::text = auth.uid()::text);
    """)

    # ── Drop old tables ───────────────────────────────────────────────────────
    op.execute("DROP POLICY IF EXISTS skills_own ON user_skills;")
    op.execute("DROP POLICY IF EXISTS languages_own ON user_languages;")
    op.drop_index('ix_user_skills_user_id', table_name='user_skills')
    op.drop_table('user_skills')
    op.drop_index('ix_user_languages_user_id', table_name='user_languages')
    op.drop_table('user_languages')


def downgrade():
    # Recreate old tables
    op.create_table(
        'user_skills',
        sa.Column('id', sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('skill', sa.Text(), nullable=False),
        sa.Column('status', sa.Text(), nullable=False, server_default='active'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_table(
        'user_languages',
        sa.Column('id', sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('language', sa.Text(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.execute("""
        INSERT INTO user_skills (user_id, skill, status, created_at)
        SELECT user_id, value, COALESCE(status, 'active'), created_at
        FROM user_profile_items WHERE type = 'skill'
    """)
    op.execute("""
        INSERT INTO user_languages (user_id, language, created_at)
        SELECT user_id, value, created_at
        FROM user_profile_items WHERE type = 'language'
    """)
    op.execute("DROP POLICY IF EXISTS profile_items_own ON user_profile_items;")
    op.drop_index('ix_profile_items_type',    table_name='user_profile_items')
    op.drop_index('ix_profile_items_user_id', table_name='user_profile_items')
    op.drop_table('user_profile_items')
