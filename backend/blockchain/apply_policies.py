import os
import psycopg2
from dotenv import load_dotenv

_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, "..", ".env"))

db_url = os.getenv("DATABASE_URL")

sql_policies = """
-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public uploads on certificates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select on certificates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates on certificates" ON storage.objects;

-- Create policies for public access on certificates bucket
CREATE POLICY "Allow public uploads on certificates" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Allow public select on certificates" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'certificates');

CREATE POLICY "Allow public updates on certificates" 
ON storage.objects FOR UPDATE 
TO public 
USING (bucket_id = 'certificates');
"""

try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Applying Supabase storage policies for the 'certificates' bucket...")
    cur.execute(sql_policies)
    print("Policies applied successfully!")
    
    cur.close()
    conn.close()
except Exception as e:
    print("Error applying policies:", e)
