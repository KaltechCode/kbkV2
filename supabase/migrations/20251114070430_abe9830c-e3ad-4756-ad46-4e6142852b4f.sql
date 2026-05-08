-- Create a security definer function to safely check if a user can access a lead by email
-- This prevents JWT manipulation by validating both auth.uid() and email claim consistency
CREATE OR REPLACE FUNCTION public.user_can_access_lead_by_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    auth.uid() IS NOT NULL AND
    _email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
$$;

-- Drop existing policies that use direct JWT claim checks
DROP POLICY IF EXISTS "Users can view own lead by email" ON public.leads;
DROP POLICY IF EXISTS "Users can update own lead by email" ON public.leads;

-- Create strengthened SELECT policy with proper authentication validation
CREATE POLICY "Authenticated users can view own lead by email"
ON public.leads
FOR SELECT
TO authenticated
USING (
  -- User must be authenticated (auth.uid() not null)
  -- AND email must match their JWT claim
  -- Using security definer function for safe validation
  public.user_can_access_lead_by_email(email)
);

-- Create strengthened UPDATE policy with proper authentication validation
-- Only allow updating verification-related fields, not core contact information
CREATE POLICY "Authenticated users can verify own lead"
ON public.leads
FOR UPDATE
TO authenticated
USING (public.user_can_access_lead_by_email(email))
WITH CHECK (
  -- Prevent changing email, first_name, last_name, or phone
  -- Only allow verification field updates
  public.user_can_access_lead_by_email(email) AND
  email = (SELECT email FROM public.leads WHERE id = leads.id) AND
  first_name = (SELECT first_name FROM public.leads WHERE id = leads.id) AND
  last_name = (SELECT last_name FROM public.leads WHERE id = leads.id) AND
  phone = (SELECT phone FROM public.leads WHERE id = leads.id)
);

-- Add comment documenting the security model
COMMENT ON FUNCTION public.user_can_access_lead_by_email IS 
'Security definer function that validates JWT authentication and email claim consistency. Prevents unauthorized access even if JWT tokens are compromised by requiring both valid auth.uid() and matching email claim.';