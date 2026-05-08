
-- Add missing columns to financial_stress_test_intakes
ALTER TABLE public.financial_stress_test_intakes
  ADD COLUMN IF NOT EXISTS preliminary_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS score_generated_at timestamp with time zone;
