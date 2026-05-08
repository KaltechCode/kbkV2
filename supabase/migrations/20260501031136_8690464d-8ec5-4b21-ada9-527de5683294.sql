ALTER TABLE public.financial_stress_test_intakes
  ADD COLUMN IF NOT EXISTS diagnostic_otp_attempts INTEGER NOT NULL DEFAULT 0;