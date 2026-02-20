"""Change user_skills.skills from TEXT[] to TEXT (one skill per row)

Revision ID: 0007_skills_single_text
Revises: 0006_rename_user_skills
Create Date: 2026-02-20
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Text

revision = '0007_skills_single_text'
down_revision = '0006_rename_user_skills'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add a temporary TEXT column for the single skill value
    op.add_column('user_skills', sa.Column('skill_new', sa.Text(), nullable=True))

    # 2. Copy the first element of each array into skill_new (handles single-element arrays)
    op.execute("""
        UPDATE user_skills
        SET skill_new = skills[1]
        WHERE skills IS NOT NULL AND array_length(skills, 1) >= 1
    """)

    # 3. For rows with more than one skill in the array, insert extra rows (one per extra skill)
    op.execute("""
        INSERT INTO user_skills (user_id, skill_new, language, status, created_at)
        SELECT user_id, unnest(skills[2:]), language, status, created_at
        FROM user_skills
        WHERE skills IS NOT NULL AND array_length(skills, 1) > 1
    """)

    # 4. Drop the old TEXT[] column and rename the new one to 'skills'
    op.drop_column('user_skills', 'skills')
    op.alter_column('user_skills', 'skill_new', new_column_name='skills')


def downgrade():
    # Reverse: aggregate per-row skill texts back into TEXT[] groups
    op.add_column('user_skills', sa.Column('skills_arr', ARRAY(Text), nullable=True))

    # Best-effort: wrap each single text value back into a 1-element array
    op.execute("""
        UPDATE user_skills
        SET skills_arr = ARRAY[skills]
        WHERE skills IS NOT NULL
    """)

    op.drop_column('user_skills', 'skills')
    op.alter_column('user_skills', 'skills_arr', new_column_name='skills')
