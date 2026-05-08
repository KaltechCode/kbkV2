
DROP POLICY IF EXISTS "Deny direct select for anon and authenticated" ON public.financial_stress_test_intakes;

CREATE POLICY "Deny direct select for anon and authenticated"
  ON public.financial_stress_test_intakes
  AS RESTRICTIVE
  FOR SELECT
  TO anon, authenticated
  USING (false);
