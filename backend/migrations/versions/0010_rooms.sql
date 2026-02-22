-- rooms: one row per skill channel (auto-created when skill is added)
CREATE TABLE IF NOT EXISTS rooms (
  id          BIGSERIAL PRIMARY KEY,
  skill       TEXT        NOT NULL UNIQUE,
  category    TEXT        NOT NULL DEFAULT 'General',
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- room_messages: all chat messages
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

CREATE POLICY "rooms_read_all"      ON rooms         FOR SELECT USING (true);
CREATE POLICY "messages_read_all"   ON room_messages FOR SELECT USING (true);
