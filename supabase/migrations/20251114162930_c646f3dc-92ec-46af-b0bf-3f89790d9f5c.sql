-- Add admin access policy for DIME reports to enable customer support
-- This allows administrators to view all DIME reports for troubleshooting and support purposes

CREATE POLICY "Admins can view all DIME reports"
ON public.dime_reports
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));