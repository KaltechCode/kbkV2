-- Add user_id columns to both tables
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id);

ALTER TABLE public.fin_reports
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id);

-- Backfill user_id based on matching emails
UPDATE public.leads l
SET user_id = u.id
FROM auth.users u
WHERE l.email = u.email AND l.user_id IS NULL;

UPDATE public.fin_reports r
SET user_id = u.id
FROM auth.users u
WHERE r.email = u.email AND r.user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE public.leads
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.fin_reports
ALTER COLUMN user_id SET NOT NULL;

-- Drop old RLS policies that used email claims
DROP POLICY IF EXISTS "Authenticated users can view own lead by email" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can verify own lead" ON public.leads;
DROP POLICY IF EXISTS "Users can view own reports" ON public.fin_reports;

-- Create new RLS policies using auth.uid()
CREATE POLICY "Users can view own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  email = (SELECT email FROM public.leads WHERE id = leads.id) AND
  first_name = (SELECT first_name FROM public.leads WHERE id = leads.id) AND
  last_name = (SELECT last_name FROM public.leads WHERE id = leads.id) AND
  phone = (SELECT phone FROM public.leads WHERE id = leads.id)
);

CREATE POLICY "Users can view own reports"
ON public.fin_reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Drop the now-unused email claim function
DROP FUNCTION IF EXISTS public.user_can_access_lead_by_email(text);