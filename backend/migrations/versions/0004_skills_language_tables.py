"""Extract skills and language into dedicated history tables

Revision ID: 0004_skills_language_tables
Revises: 0003_fix_grants
Create Date: 2026-02-20
"""
from alembic import op
import sqlalchemy as sa

revision = '0004_skills_language_tables'
down_revision = '0003_fix_grants'
branch_labels = None
depends_on = None


def upgrade():
    # ── user_skills ───────────────────────────────────────────────────────────
    op.create_table(
        'user_skills',
        sa.Column('id', sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('skill', sa.Text(), nullable=False),
        sa.Column('status', sa.Text(), nullable=False, server_default='active'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.CheckConstraint("status IN ('active', 'completed', 'paused')", name='user_skills_status_check'),
    )
    op.create_index('ix_user_skills_user_id', 'user_skills', ['user_id'])

    # ── user_languages ────────────────────────────────────────────────────────
    op.create_table(
        'user_languages',
        sa.Column('id', sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('language', sa.Text(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_user_languages_user_id', 'user_languages', ['user_id'])

    # ── Migrate existing data ─────────────────────────────────────────────────
    # users.skills is a TEXT[] array — unnest each element into a row
    op.execute("""
        INSERT INTO user_skills (user_id, skill, status, created_at)
        SELECT id, unnest(skills), 'active', NOW()
        FROM users
        WHERE skills IS NOT NULL AND array_length(skills, 1) > 0
    """)

    # users.language is a plain TEXT field
    op.execute("""
        INSERT INTO user_languages (user_id, language, created_at)
        SELECT id, language, NOW()
        FROM users
        WHERE language IS NOT NULL AND language <> ''
    """)

    # ── Grants ────────────────────────────────────────────────────────────────
    for table in ['user_skills', 'user_languages']:
        for role in ['service_role', 'authenticated', 'anon']:
            op.execute(f"GRANT ALL ON TABLE {table} TO {role};")
        op.execute(
            f"GRANT USAGE, SELECT ON SEQUENCE {table}_id_seq "
            "TO service_role, authenticated, anon;"
        )

    # ── RLS ───────────────────────────────────────────────────────────────────
    op.execute("ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY skills_own ON user_skills
        USING (user_id::text = auth.uid()::text)
        WITH CHECK (user_id::text = auth.uid()::text);
    """)

    op.execute("ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;")
    op.execute("""
        CREATE POLICY languages_own ON user_languages
        USING (user_id::text = auth.uid()::text)
        WITH CHECK (user_id::text = auth.uid()::text);
    """)


def downgrade():
    op.execute("DROP POLICY IF EXISTS languages_own ON user_languages;")
    op.execute("DROP POLICY IF EXISTS skills_own ON user_skills;")
    op.drop_index('ix_user_languages_user_id', table_name='user_languages')
    op.drop_table('user_languages')
    op.drop_index('ix_user_skills_user_id', table_name='user_skills')
    op.drop_table('user_skills')
