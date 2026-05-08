-- Restrict leads INSERT policy to service role only
-- This prevents direct client-side spam while allowing the create-lead edge function to create leads

DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

CREATE POLICY "Service role can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Note: The create-lead edge function now handles all lead creation with rate limiting
-- and validation, providing better security against spam and fake leads