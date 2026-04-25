-- ============================================================
-- Migration: Add user ownership + Row Level Security
-- Run this in your Supabase project → SQL Editor
-- ============================================================

-- 1. Delete all existing shared data
DELETE FROM ai_summaries;
DELETE FROM variants;
DELETE FROM pipeline_steps;
DELETE FROM cases;

-- 2. Add user_id column to cases
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);

-- 3. Enable Row Level Security on all tables
ALTER TABLE cases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries   ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for cases (direct user ownership)
CREATE POLICY "users_select_own_cases" ON cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_cases" ON cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_cases" ON cases
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. RLS policies for variants (via case ownership)
CREATE POLICY "users_select_own_variants" ON variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = variants.case_id
        AND cases.user_id = auth.uid()
    )
  );

-- 6. RLS policies for pipeline_steps (via case ownership)
CREATE POLICY "users_select_own_pipeline_steps" ON pipeline_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = pipeline_steps.case_id
        AND cases.user_id = auth.uid()
    )
  );

-- 7. RLS policies for ai_summaries (via case ownership)
CREATE POLICY "users_select_own_ai_summaries" ON ai_summaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = ai_summaries.case_id
        AND cases.user_id = auth.uid()
    )
  );

-- Note: INSERT/UPDATE/DELETE on variants, pipeline_steps, and ai_summaries
-- is done by the workflow using the service role key, which bypasses RLS.
-- No insert policies needed for those tables.
