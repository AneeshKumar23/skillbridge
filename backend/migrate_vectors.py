"""
Migration: enable pgvector, convert user_chat_messages.embedding to halfvec(3072),
and create an HNSW cosine index.

halfvec is required for vectors with >2000 dimensions (pgvector 0.7+).
gemini-embedding-001 returns 3072-D float32 vectors.
"""

import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

import psycopg2

db_url = os.getenv("DATABASE_URL")
print("Connecting...")

conn = psycopg2.connect(db_url)
conn.autocommit = True
cur = conn.cursor()

# 1. Enable pgvector
cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
print("pgvector extension: OK")

# 2. Check current column udt_name
cur.execute("""
SELECT udt_name
FROM information_schema.columns
WHERE table_name = 'user_chat_messages'
  AND column_name = 'embedding';
""")
row = cur.fetchone()
udt = row[0] if row else None
print("Current embedding udt:", udt)

# 3. Ensure the column is halfvec(3072)
if udt is None:
    print("Column missing — adding halfvec(3072)...")
    cur.execute("""
    ALTER TABLE public.user_chat_messages
      ADD COLUMN IF NOT EXISTS embedding halfvec(3072);
    """)
    print("Column added!")
elif udt == "halfvec":
    print("Column is already halfvec — no change needed.")
else:
    # Currently vector(3072) or something else — drop and re-add as halfvec
    print(f"Column is {udt} — converting to halfvec(3072)...")
    cur.execute("ALTER TABLE public.user_chat_messages DROP COLUMN embedding;")
    cur.execute("ALTER TABLE public.user_chat_messages ADD COLUMN embedding halfvec(3072);")
    print("Column recreated as halfvec(3072)!")

# 4. Drop any old indexes and create HNSW on halfvec
cur.execute("DROP INDEX IF EXISTS user_chat_messages_embedding_idx;")
cur.execute("DROP INDEX IF EXISTS user_chat_messages_embedding_hnsw_idx;")
cur.execute("""
CREATE INDEX IF NOT EXISTS user_chat_messages_embedding_hnsw_idx
  ON public.user_chat_messages
  USING hnsw (embedding halfvec_cosine_ops)
  WITH (m = 16, ef_construction = 64);
""")
print("HNSW index on halfvec: OK")

cur.close()
conn.close()
print("Migration complete!")
