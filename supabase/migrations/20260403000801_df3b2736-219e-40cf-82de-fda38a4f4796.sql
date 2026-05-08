
-- Block UPDATE for anon and authenticated (RESTRICTIVE)
CREATE POLICY "Deny direct update for anon and authenticated"
  ON public.contact_messages
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Block DELETE for anon and authenticated (RESTRICTIVE)
CREATE POLICY "Deny direct delete for anon and authenticated"
  ON public.contact_messages
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (false);

-- Block direct INSERT for authenticated (RESTRICTIVE) - only anon should insert via edge function ideally, but we allow anon INSERT
CREATE POLICY "Deny direct insert for authenticated"
  ON public.contact_messages
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Allow anon INSERT (form submissions)
CREATE POLICY "Anon can insert contact messages"
  ON public.contact_messages
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);
