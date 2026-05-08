
-- Remove the restrictive INSERT block on authenticated
DROP POLICY "Deny direct insert for authenticated" ON public.contact_messages;

-- Replace anon-only INSERT with anon + authenticated
DROP POLICY "Anon can insert contact messages" ON public.contact_messages;

CREATE POLICY "Anon and authenticated can insert contact messages"
  ON public.contact_messages
  AS PERMISSIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
