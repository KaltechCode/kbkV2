ALTER TABLE public.financial_stress_test_intakes
ADD COLUMN diagnostic_otp_hash text,
ADD COLUMN diagnostic_otp_expires_at timestamp with time zone;