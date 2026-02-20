"""Grant table privileges and add RLS policies for new modular tables

Revision ID: 0003_fix_grants
Revises: 0002_modular_tables
Create Date: 2026-02-20
"""
from alembic import op

revision = '0003_fix_grants'
down_revision = '0002_modular_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Grant table-level access to Supabase roles ────────────────────────────
    # service_role: used by FastAPI (bypasses RLS but still needs GRANT)
    # authenticated: used by client-side Supabase queries (respects RLS)
    for table in ('user_chat_messages', 'user_roadmaps', 'user_resources'):
        op.execute(f"GRANT ALL ON TABLE {table} TO service_role")
        op.execute(f"GRANT ALL ON TABLE {table} TO authenticated")
        op.execute(f"GRANT ALL ON TABLE {table} TO anon")

    # Grant usage on sequences so auto-increment works
    for seq in (
        'user_chat_messages_id_seq',
        'user_roadmaps_id_seq',
        'user_resources_id_seq',
    ):
        op.execute(f"GRANT USAGE, SELECT ON SEQUENCE {seq} TO service_role")
        op.execute(f"GRANT USAGE, SELECT ON SEQUENCE {seq} TO authenticated")

    # ── RLS policies (mirrors the pattern used in 0001_initial) ───────────────
    op.execute("""
        CREATE POLICY chat_own ON user_chat_messages
        FOR ALL USING (auth.uid()::text = user_id)
    """)
    op.execute("""
        CREATE POLICY roadmaps_own ON user_roadmaps
        FOR ALL USING (auth.uid()::text = user_id)
    """)
    op.execute("""
        CREATE POLICY resources_own ON user_resources
        FOR ALL USING (auth.uid()::text = user_id)
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS resources_own ON user_resources")
    op.execute("DROP POLICY IF EXISTS roadmaps_own  ON user_roadmaps")
    op.execute("DROP POLICY IF EXISTS chat_own      ON user_chat_messages")
