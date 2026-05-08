-- Add session token columns to financial_stress_test_intakes table
ALTER TABLE public.financial_stress_test_intakes
ADD COLUMN session_token_hash text,
ADD COLUMN session_token_expires_at timestamp with time zone;