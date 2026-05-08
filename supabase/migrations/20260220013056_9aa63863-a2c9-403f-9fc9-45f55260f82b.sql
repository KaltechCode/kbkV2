
-- 1. Enable RLS (idempotent)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;

-- 2. Revoke all from anon and authenticated
REVOKE ALL ON public.leads FROM anon;
REVOKE ALL ON public.leads FROM authenticated;

-- 3. Grant full access to service_role
GRANT ALL ON public.leads TO service_role;

-- 4. Drop existing SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;

-- 5. Deny all direct SELECT for anon and authenticated
DROP POLICY IF EXISTS "Deny direct select access" ON public.leads;

CREATE POLICY "Deny direct select access"
  ON public.leads
  AS RESTRICTIVE
  FOR SELECT
  TO anon, authenticated
  USING (false);
