
CREATE TABLE public.abandonment_run_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at timestamptz NOT NULL DEFAULT now(),
  processed integer NOT NULL DEFAULT 0,
  sent integer NOT NULL DEFAULT 0,
  skipped integer NOT NULL DEFAULT 0,
  errors integer NOT NULL DEFAULT 0,
  error_details jsonb,
  duration_ms integer
);

CREATE INDEX abandonment_run_logs_ran_at_idx ON public.abandonment_run_logs (ran_at DESC);

ALTER TABLE public.abandonment_run_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view abandonment run logs"
  ON public.abandonment_run_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny direct insert for anon and authenticated"
  ON public.abandonment_run_logs
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny direct update for anon and authenticated"
  ON public.abandonment_run_logs
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny direct delete for anon and authenticated"
  ON public.abandonment_run_logs
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (false);
