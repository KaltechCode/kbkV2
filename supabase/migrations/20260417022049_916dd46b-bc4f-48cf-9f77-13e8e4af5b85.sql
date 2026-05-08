ALTER TABLE public.financial_stress_test_intakes
ADD COLUMN IF NOT EXISTS abandonment_email_sent boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_intakes_abandonment_scan
ON public.financial_stress_test_intakes (payment_status, abandonment_email_sent)
WHERE intake_progress IS NOT NULL AND abandonment_email_sent = false;