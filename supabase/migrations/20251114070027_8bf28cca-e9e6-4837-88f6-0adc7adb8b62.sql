-- Drop the faulty UPDATE policy that allows anyone to modify any lead
DROP POLICY IF EXISTS "Anyone can update own lead by email" ON public.leads;

-- Create a secure UPDATE policy that properly validates user identity
CREATE POLICY "Users can update own lead by email"
ON public.leads
FOR UPDATE
USING (email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text))
WITH CHECK (email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));