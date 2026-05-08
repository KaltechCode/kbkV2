-- Make user_id nullable to support unauthenticated lead capture
ALTER TABLE public.leads
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.fin_reports
ALTER COLUMN user_id DROP NOT NULL;

-- Update INSERT policy for leads to set user_id when authenticated
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

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

-- Update INSERT policy for fin_reports similarly
DROP POLICY IF EXISTS "Anyone can insert reports" ON public.fin_reports;

CREATE POLICY "Users can insert reports"
ON public.fin_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- If authenticated, must set user_id to auth.uid()
  -- If anonymous, user_id must be NULL
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);