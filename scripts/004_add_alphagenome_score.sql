-- Persist AlphaGenome variant effect score (peak log-fold-change in RNA expression)
ALTER TABLE variants
  ADD COLUMN IF NOT EXISTS alphagenome_score DECIMAL;
