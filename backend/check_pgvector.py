import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
import psycopg2

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()
cur.execute("SELECT extversion FROM pg_extension WHERE extname = 'vector';")
print("pgvector version:", cur.fetchone())
cur.close()
conn.close()
