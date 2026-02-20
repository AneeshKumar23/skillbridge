"""Initial schema - users, user_prompts, user_outputs

Revision ID: 0001_initial
Revises: 
Create Date: 2026-02-20
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id',           sa.String(),  primary_key=True),
        sa.Column('email',        sa.String(),  nullable=False, unique=True),
        sa.Column('first_name',   sa.String(),  nullable=False, server_default=''),
        sa.Column('last_name',    sa.String(),  server_default=''),
        sa.Column('phone_number', sa.String(),  server_default=''),
        sa.Column('terms_and_conditions', sa.Boolean(), server_default='false'),
        sa.Column('street_address', sa.String(), server_default=''),
        sa.Column('city',         sa.String(),  server_default=''),
        sa.Column('state',        sa.String(),  server_default=''),
        sa.Column('zip_code',     sa.String(),  server_default=''),
        sa.Column('country',      sa.String(),  server_default=''),
        sa.Column('language',     sa.String(),  server_default=''),
        sa.Column('skills',       postgresql.ARRAY(sa.Text()), server_default='{}'),
        sa.Column('created_at',   sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )

    # ── user_prompts ───────────────────────────────────────────────────────────
    op.create_table(
        'user_prompts',
        sa.Column('id',         sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id',    sa.String(),     sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('prompt',     sa.Text(),       nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )

    # ── user_outputs ───────────────────────────────────────────────────────────
    op.create_table(
        'user_outputs',
        sa.Column('id',         sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id',    sa.String(),     sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('output',     sa.Text(),       nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )

    # ── Row Level Security ─────────────────────────────────────────────────────
    op.execute("ALTER TABLE users        ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE user_prompts ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE user_outputs ENABLE ROW LEVEL SECURITY")

    op.execute("""
        CREATE POLICY user_select_own ON users
        FOR SELECT USING (auth.uid()::text = id)
    """)
    op.execute("""
        CREATE POLICY user_update_own ON users
        FOR UPDATE USING (auth.uid()::text = id)
    """)
    op.execute("""
        CREATE POLICY prompts_own ON user_prompts
        FOR ALL USING (auth.uid()::text = user_id)
    """)
    op.execute("""
        CREATE POLICY outputs_own ON user_outputs
        FOR ALL USING (auth.uid()::text = user_id)
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS outputs_own  ON user_outputs")
    op.execute("DROP POLICY IF EXISTS prompts_own  ON user_prompts")
    op.execute("DROP POLICY IF EXISTS user_update_own ON users")
    op.execute("DROP POLICY IF EXISTS user_select_own ON users")
    op.drop_table('user_outputs')
    op.drop_table('user_prompts')
    op.drop_table('users')
