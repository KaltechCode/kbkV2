
ALTER TABLE public.detailed_diagnostics
  ADD COLUMN top_risk_1 text DEFAULT NULL,
  ADD COLUMN top_risk_2 text DEFAULT NULL,
  ADD COLUMN top_risk_3 text DEFAULT NULL;
