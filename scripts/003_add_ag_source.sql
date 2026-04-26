-- Add ag_source column to variants table to track AlphaGenome vs simulated predictions
ALTER TABLE variants
  ADD COLUMN IF NOT EXISTS ag_source TEXT
    CHECK (ag_source IN ('alphagenome', 'estimated'));
