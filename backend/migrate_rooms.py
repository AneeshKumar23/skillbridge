"""Run once: create rooms and room_messages tables in Supabase Postgres."""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

sql = """
CREATE TABLE IF NOT EXISTS rooms (
  id          BIGSERIAL PRIMARY KEY,
  skill       TEXT        NOT NULL UNIQUE,
  category    TEXT        NOT NULL DEFAULT 'General',
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_messages (
  id          BIGSERIAL   PRIMARY KEY,
  room_id     BIGINT      NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id     TEXT        NOT NULL,
  username    TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS room_messages_room_created
  ON room_messages (room_id, created_at DESC);

ALTER TABLE rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rooms' AND policyname='rooms_read_all') THEN
    CREATE POLICY "rooms_read_all" ON rooms FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='room_messages' AND policyname='messages_read_all') THEN
    CREATE POLICY "messages_read_all" ON room_messages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rooms' AND policyname='rooms_insert_all') THEN
    CREATE POLICY "rooms_insert_all" ON rooms FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='room_messages' AND policyname='messages_insert_all') THEN
    CREATE POLICY "messages_insert_all" ON room_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;
"""

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
conn.autocommit = True
cur = conn.cursor()
cur.execute(sql)
cur.close()
conn.close()
print("Migration complete.")
