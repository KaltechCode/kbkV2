
-- Deny INSERT for anon and authenticated
CREATE POLICY "Deny direct insert for anon and authenticated"
  ON public.financial_stress_test_intakes
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- Deny UPDATE for anon and authenticated
CREATE POLICY "Deny direct update for anon and authenticated"
  ON public.financial_stress_test_intakes
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Deny DELETE for anon and authenticated
CREATE POLICY "Deny direct delete for anon and authenticated"
  ON public.financial_stress_test_intakes
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (false);
