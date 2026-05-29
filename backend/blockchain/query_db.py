import os
import psycopg2
from dotenv import load_dotenv

_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, "..", ".env"))

db_url = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    print("Checking RLS on storage.objects:")
    cur.execute("SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'storage';")
    for row in cur.fetchall():
        print(f"Table: {row[0]}, RLS Enabled: {row[1]}")
        
    print("\nChecking policies on storage.objects:")
    cur.execute("SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname = 'storage';")
    for row in cur.fetchall():
        print(f"Policy: {row[0]}, Cmd: {row[1]}, Roles: {row[2]}")
        
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
