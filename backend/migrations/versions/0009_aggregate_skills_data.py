"""Aggregate fragmented skill/language rows into single snapshots

Revision ID: 0009_aggregate_skills_data
Revises: 0008_skills_back_to_array
Create Date: 2026-02-20
"""
from alembic import op
import sqlalchemy as sa

revision = '0009_aggregate_skills_data'
down_revision = '0008_skills_back_to_array'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE TEMP TABLE temp_user_skills AS
        SELECT 
            user_id,
            array_agg(DISTINCT s) FILTER (WHERE s IS NOT NULL) as skills,
            (array_agg(language ORDER BY created_at DESC) FILTER (WHERE language IS NOT NULL))[1] as language,
            MAX(created_at) as created_at
        FROM (
            SELECT user_id, unnest(skills) as s, language, created_at
            FROM user_skills
            WHERE skills IS NOT NULL
            UNION ALL
            SELECT user_id, NULL as s, language, created_at
            FROM user_skills
            WHERE language IS NOT NULL
        ) sub
        GROUP BY user_id;
        
        DELETE FROM user_skills;
        
        INSERT INTO user_skills (user_id, skills, language, status, created_at)
        SELECT user_id, COALESCE(skills, '{}'), language, 'active', created_at
        FROM temp_user_skills;
        
        DROP TABLE temp_user_skills;
    """)

def downgrade():
    pass
