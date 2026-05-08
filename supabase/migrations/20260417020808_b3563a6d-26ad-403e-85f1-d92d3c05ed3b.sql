-- Add resume token + intake_progress columns
ALTER TABLE public.financial_stress_test_intakes
  ADD COLUMN IF NOT EXISTS resume_token_hash text,
  ADD COLUMN IF NOT EXISTS resume_token_last4 text,
  ADD COLUMN IF NOT EXISTS resume_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS intake_progress jsonb;

-- Unique index on hash so token lookups are fast and collisions impossible
CREATE UNIQUE INDEX IF NOT EXISTS financial_stress_test_intakes_resume_token_hash_idx
  ON public.financial_stress_test_intakes (resume_token_hash)
  WHERE resume_token_hash IS NOT NULL;