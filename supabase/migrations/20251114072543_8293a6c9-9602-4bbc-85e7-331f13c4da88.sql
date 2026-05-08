-- Drop ALL existing policies on leads table to start fresh
DROP POLICY IF EXISTS "Authenticated users can view own lead by email" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can verify own lead" ON public.leads;
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Keep the admin policy
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own leads
CREATE POLICY "Authenticated users can view own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own leads (for verification)
CREATE POLICY "Authenticated users can update own leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Keep the insert policy for unauthenticated lead capture
CREATE POLICY "Anyone can insert leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- If authenticated, must set user_id to auth.uid()
  -- If anonymous, user_id must be NULL
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);