
-- Drop redundant service_role policies (service_role bypasses RLS entirely)

-- financial_stress_test_intakes
DROP POLICY IF EXISTS "Service role can insert intakes" ON public.financial_stress_test_intakes;
DROP POLICY IF EXISTS "Service role can update intakes" ON public.financial_stress_test_intakes;

-- detailed_diagnostics
DROP POLICY IF EXISTS "Service role can insert detailed diagnostics" ON public.detailed_diagnostics;
DROP POLICY IF EXISTS "Service role can update detailed diagnostics" ON public.detailed_diagnostics;
DROP POLICY IF EXISTS "Service role can select detailed diagnostics" ON public.detailed_diagnostics;

-- email_delivery_logs
DROP POLICY IF EXISTS "Service role can insert email delivery logs" ON public.email_delivery_logs;

-- leads
DROP POLICY IF EXISTS "Service role can insert leads" ON public.leads;

-- contact_messages
DROP POLICY IF EXISTS "Service role can insert contact messages" ON public.contact_messages;
