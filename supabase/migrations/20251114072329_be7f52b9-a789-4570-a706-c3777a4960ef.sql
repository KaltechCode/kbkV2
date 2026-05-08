-- Drop existing policies on fin_reports
DROP POLICY IF EXISTS "Users can view own reports" ON public.fin_reports;
DROP POLICY IF EXISTS "Users can insert reports" ON public.fin_reports;

-- Create new SELECT policy using auth.uid()
CREATE POLICY "Users can view own reports"
ON public.fin_reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create new INSERT policy requiring authentication
CREATE POLICY "Users can insert own reports"
ON public.fin_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create UPDATE policy for authenticated users
CREATE POLICY "Users can update own reports"
ON public.fin_reports
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));