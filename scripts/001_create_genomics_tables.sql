-- GenomeReview Clinical Genomics Tables

-- Cases table: stores patient case information
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_dob DATE NOT NULL,
  mrn TEXT NOT NULL,
  ordering_physician TEXT NOT NULL,
  indication TEXT NOT NULL,
  gene_panel TEXT[] NOT NULL,
  priority TEXT NOT NULL DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'awaiting_review', 'under_review', 'completed', 'failed')),
  workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Variants table: stores discovered variants for each case
CREATE TABLE IF NOT EXISTS variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  gene TEXT NOT NULL,
  hgvs_c TEXT NOT NULL,
  hgvs_p TEXT,
  chromosome TEXT NOT NULL,
  position BIGINT NOT NULL,
  ref_allele TEXT NOT NULL,
  alt_allele TEXT NOT NULL,
  zygosity TEXT NOT NULL CHECK (zygosity IN ('heterozygous', 'homozygous', 'hemizygous')),
  classification TEXT NOT NULL CHECK (classification IN ('pathogenic', 'likely_pathogenic', 'vus', 'likely_benign', 'benign')),
  gnomad_af DECIMAL,
  clinvar_id TEXT,
  clinvar_significance TEXT,
  acmg_criteria TEXT[],
  ai_reasoning TEXT,
  ai_confidence DECIMAL,
  reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pipeline steps table: tracks each step in the analysis workflow
CREATE TABLE IF NOT EXISTS pipeline_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INT,
  output JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI summaries table: stores Claude-generated clinical narratives
CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_findings TEXT[] NOT NULL,
  recommendations TEXT[],
  model_used TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_workflow_id ON cases(workflow_id);
CREATE INDEX IF NOT EXISTS idx_variants_case_id ON variants(case_id);
CREATE INDEX IF NOT EXISTS idx_variants_classification ON variants(classification);
CREATE INDEX IF NOT EXISTS idx_pipeline_steps_case_id ON pipeline_steps(case_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_case_id ON ai_summaries(case_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to cases table
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
