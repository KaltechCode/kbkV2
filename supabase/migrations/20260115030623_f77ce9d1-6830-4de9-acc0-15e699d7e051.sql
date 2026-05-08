-- =====================================================
-- Security Hardening Migration
-- =====================================================

-- 1. Drop existing overly permissive INSERT policies on leads
DROP POLICY IF EXISTS "Service role can insert leads" ON public.leads;

-- 2. Create new INSERT policy explicitly scoped to service_role
CREATE POLICY "Service role can insert leads"
ON public.leads
FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. Drop existing overly permissive INSERT policies on dime_reports
DROP POLICY IF EXISTS "Service role can insert DIME reports" ON public.dime_reports;

-- 4. Create new INSERT policy explicitly scoped to service_role for dime_reports
CREATE POLICY "Service role can insert DIME reports"
ON public.dime_reports
FOR INSERT
TO service_role
WITH CHECK (true);

-- 5. Drop existing INSERT policy on fin_reports that allows authenticated users
DROP POLICY IF EXISTS "Users can insert own reports" ON public.fin_reports;

-- 6. Create service-role only INSERT policy for fin_reports
CREATE POLICY "Service role can insert fin_reports"
ON public.fin_reports
FOR INSERT
TO service_role
WITH CHECK (true);

-- 7. Explicitly revoke INSERT from anon and authenticated on leads
REVOKE INSERT ON public.leads FROM anon, authenticated;

-- 8. Explicitly revoke INSERT from anon and authenticated on dime_reports  
REVOKE INSERT ON public.dime_reports FROM anon, authenticated;

-- 9. Explicitly revoke INSERT from anon and authenticated on fin_reports
REVOKE INSERT ON public.fin_reports FROM anon, authenticated;

-- 10. Drop the existing UPDATE policy on leads that allows identity field changes
DROP POLICY IF EXISTS "Authenticated users can update own leads" ON public.leads;

-- 11. Create restrictive UPDATE policy on leads - only allow verification-related updates
-- Non-admin users can ONLY update verification fields, not identity fields
CREATE POLICY "Users can update verification status on own leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND first_name = (SELECT first_name FROM public.leads WHERE id = leads.id)
  AND last_name = (SELECT last_name FROM public.leads WHERE id = leads.id)  
  AND phone = (SELECT phone FROM public.leads WHERE id = leads.id)
  AND email = (SELECT email FROM public.leads WHERE id = leads.id)
);

-- 12. Ensure admins can still update all fields on leads
DROP POLICY IF EXISTS "Admins can update all leads" ON public.leads;
CREATE POLICY "Admins can update all leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));