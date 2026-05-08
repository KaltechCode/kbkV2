
-- Create a security definer function to compare new values against originals
CREATE OR REPLACE FUNCTION public.leads_pii_unchanged(
  _lead_id uuid,
  _first_name text,
  _last_name text,
  _email text,
  _phone text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.leads
    WHERE id = _lead_id
      AND first_name = _first_name
      AND last_name = _last_name
      AND email = _email
      AND phone = _phone
  )
$$;

-- Replace the broken policy
DROP POLICY "Users can update verification status on own leads" ON public.leads;

CREATE POLICY "Users can update verification status on own leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND public.leads_pii_unchanged(id, first_name, last_name, email, phone)
  );
