-- =============================================================
-- SkillBridge — Supabase Schema
-- Run this in your Supabase project: Dashboard → SQL Editor
-- =============================================================

-- ── Users profile table ────────────────────────────────────────
-- id matches Supabase Auth UUID so both systems stay in sync

CREATE TABLE IF NOT EXISTS public.users (
  id            TEXT PRIMARY KEY,       -- Supabase Auth user UUID (auth.users.id)
  email         TEXT UNIQUE NOT NULL,
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT         DEFAULT '',
  phone_number  TEXT         DEFAULT '',
  terms_and_conditions BOOLEAN DEFAULT FALSE,
  street_address TEXT        DEFAULT '',
  city          TEXT         DEFAULT '',
  state         TEXT         DEFAULT '',
  zip_code      TEXT         DEFAULT '',
  country       TEXT         DEFAULT '',
  language      TEXT         DEFAULT '',
  skills        TEXT[]       DEFAULT '{}',
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ── User prompts table ─────────────────────────────────────────
-- Each sent message is a row (replaces MongoDB $push arrays)

CREATE TABLE IF NOT EXISTS public.user_prompts (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  prompt     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── User outputs table ─────────────────────────────────────────
-- Stores certificate public URLs and other generated outputs

CREATE TABLE IF NOT EXISTS public.user_outputs (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  output     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ─────────────────────────────────────────
-- The FastAPI backend uses the service_role key which bypasses RLS.
-- These policies are for any future direct-client (Supabase JS) access.

ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_outputs ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "user_select_own"  ON public.users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "user_update_own"  ON public.users FOR UPDATE USING (auth.uid()::text = id);

-- Prompts
CREATE POLICY "prompts_own" ON public.user_prompts FOR ALL USING (auth.uid()::text = user_id);

-- Outputs
CREATE POLICY "outputs_own" ON public.user_outputs FOR ALL USING (auth.uid()::text = user_id);

-- ── Storage bucket ─────────────────────────────────────────────
-- Run this once in the Supabase Storage UI or uncomment here:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('certificates', 'certificates', true)
-- ON CONFLICT DO NOTHING;
--
-- CREATE POLICY "certs_public_read" ON storage.objects
--   FOR SELECT USING (bucket_id = 'certificates');
--
-- CREATE POLICY "certs_service_insert" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'certificates');
