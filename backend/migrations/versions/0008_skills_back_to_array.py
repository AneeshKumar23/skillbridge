"""Revert skills column back to TEXT[] (array of skill names per row)

Revision ID: 0008_skills_back_to_array
Revises: 0007_skills_single_text
Create Date: 2026-02-20
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Text

revision = '0008_skills_back_to_array'
down_revision = '0007_skills_single_text'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add new TEXT[] column
    op.add_column('user_skills', sa.Column('skills_arr', ARRAY(Text), nullable=True))

    # 2. Wrap each existing single-text value into a 1-element array
    op.execute("""
        UPDATE user_skills
        SET skills_arr = ARRAY[skills]
        WHERE skills IS NOT NULL
    """)

    # 3. Drop old TEXT column and rename
    op.drop_column('user_skills', 'skills')
    op.alter_column('user_skills', 'skills_arr', new_column_name='skills')


def downgrade():
    op.add_column('user_skills', sa.Column('skill_text', sa.Text(), nullable=True))
    op.execute("""
        UPDATE user_skills
        SET skill_text = skills[1]
        WHERE skills IS NOT NULL AND array_length(skills, 1) >= 1
    """)
    op.drop_column('user_skills', 'skills')
    op.alter_column('user_skills', 'skill_text', new_column_name='skills')
