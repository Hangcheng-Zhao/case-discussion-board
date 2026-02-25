-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This creates the tables needed for the Case Discussion app (multi-tenant)

-- 1. Case config (one row per case)
CREATE TABLE case_config (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Case Discussion',
  board_title TEXT NOT NULL DEFAULT 'Case Discussion Board',
  description TEXT NOT NULL DEFAULT 'Classroom Case Discussion Board',
  sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  sentiment_positive TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  sentiment_negative TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Session config (one row per case+session combo)
CREATE TABLE session_config (
  case_id TEXT NOT NULL REFERENCES case_config(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  display_mode TEXT NOT NULL DEFAULT 'controlled' CHECK (display_mode IN ('controlled', 'live')),
  revealed_step INTEGER NOT NULL DEFAULT -1,
  PRIMARY KEY (case_id, session_id)
);

-- 3. Responses table
CREATE TABLE responses (
  id BIGSERIAL PRIMARY KEY,
  case_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  step INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  answer TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  poll_choice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_responses_case_session ON responses(case_id, session_id);
CREATE INDEX idx_responses_step ON responses(step);
CREATE UNIQUE INDEX idx_responses_unique ON responses(case_id, session_id, step, student_name);

-- Row Level Security
ALTER TABLE case_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read case_config" ON case_config FOR SELECT USING (true);
CREATE POLICY "Allow public update case_config" ON case_config FOR UPDATE USING (true);
CREATE POLICY "Allow public insert case_config" ON case_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete case_config" ON case_config FOR DELETE USING (true);

CREATE POLICY "Allow public read session_config" ON session_config FOR SELECT USING (true);
CREATE POLICY "Allow public update session_config" ON session_config FOR UPDATE USING (true);
CREATE POLICY "Allow public insert session_config" ON session_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete session_config" ON session_config FOR DELETE USING (true);

CREATE POLICY "Allow public read responses" ON responses FOR SELECT USING (true);
CREATE POLICY "Allow public insert responses" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete responses" ON responses FOR DELETE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE case_config;
ALTER PUBLICATION supabase_realtime ADD TABLE session_config;
ALTER PUBLICATION supabase_realtime ADD TABLE responses;
