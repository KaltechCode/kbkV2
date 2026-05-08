-- Drop existing policies that rely on email-based access
DROP POLICY IF EXISTS "Authenticated users can view own lead by email" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can verify own lead" ON public.leads;
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;

-- Create new SELECT policy using user_id
CREATE POLICY "Authenticated users can view own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create new UPDATE policy using user_id
CREATE POLICY "Authenticated users can update own leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Recreate admin policy without email dependency
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));