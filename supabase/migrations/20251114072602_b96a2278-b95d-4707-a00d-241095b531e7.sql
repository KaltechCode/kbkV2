-- First, let's see what policies exist and drop ALL relevant ones
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'leads' 
        AND schemaname = 'public'
        AND policyname NOT LIKE 'Anyone can insert leads'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', policy_name);
    END LOOP;
END $$;

-- Now create the new policies
CREATE POLICY "Authenticated users can view own leads"
ON public.leads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can update own leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));