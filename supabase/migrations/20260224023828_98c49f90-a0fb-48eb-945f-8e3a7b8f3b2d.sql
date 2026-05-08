
-- Table for the comprehensive financial stress analysis wizard data
CREATE TABLE public.detailed_diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intake_id UUID NOT NULL REFERENCES public.financial_stress_test_intakes(id),

  -- Step 1: Income Structure
  client_annual_gross_income NUMERIC NOT NULL DEFAULT 0,
  spouse_annual_gross_income NUMERIC NOT NULL DEFAULT 0,
  monthly_take_home_income NUMERIC NOT NULL DEFAULT 0,
  monthly_essential_expenses NUMERIC NOT NULL DEFAULT 0,
  monthly_lifestyle_expenses NUMERIC NOT NULL DEFAULT 0,

  -- Step 2: Liquidity Position
  emergency_fund_balance NUMERIC NOT NULL DEFAULT 0,
  other_liquid_savings NUMERIC NOT NULL DEFAULT 0,
  total_retirement_savings NUMERIC NOT NULL DEFAULT 0,
  total_non_retirement_investments NUMERIC NOT NULL DEFAULT 0,

  -- Step 3: Debt & Obligations
  mortgage_balance NUMERIC NOT NULL DEFAULT 0,
  total_consumer_debt NUMERIC NOT NULL DEFAULT 0,
  student_loans NUMERIC NOT NULL DEFAULT 0,
  credit_card_debt NUMERIC NOT NULL DEFAULT 0,

  -- Step 4: Protection Alignment
  life_insurance_client NUMERIC NOT NULL DEFAULT 0,
  life_insurance_spouse NUMERIC NOT NULL DEFAULT 0,
  has_disability_coverage BOOLEAN NOT NULL DEFAULT false,
  income_replacement_years NUMERIC NOT NULL DEFAULT 10,

  -- Step 5: Retirement Position
  expected_retirement_age NUMERIC NOT NULL DEFAULT 65,
  desired_monthly_retirement_income NUMERIC NOT NULL DEFAULT 0,
  annual_retirement_contributions NUMERIC NOT NULL DEFAULT 0,

  -- Step 6: Education & Legacy
  number_of_children INTEGER NOT NULL DEFAULT 0,
  estimated_college_funding_goal NUMERIC NOT NULL DEFAULT 0,
  current_college_savings NUMERIC NOT NULL DEFAULT 0,

  -- Server-side scoring (hidden from client)
  pillar_scores JSONB,
  ratios JSONB,
  total_score NUMERIC,
  risk_classification TEXT,

  -- Workflow status
  status TEXT NOT NULL DEFAULT 'submitted',
  admin_reviewed BOOLEAN NOT NULL DEFAULT false,
  report_sent BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.detailed_diagnostics ENABLE ROW LEVEL SECURITY;

-- Revoke all from anon and authenticated
REVOKE ALL ON public.detailed_diagnostics FROM anon, authenticated;

-- Grant select to authenticated for admin policy
GRANT SELECT ON public.detailed_diagnostics TO authenticated;

-- Service role can insert
CREATE POLICY "Service role can insert detailed diagnostics"
  ON public.detailed_diagnostics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can update
CREATE POLICY "Service role can update detailed diagnostics"
  ON public.detailed_diagnostics
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Service role can select
CREATE POLICY "Service role can select detailed diagnostics"
  ON public.detailed_diagnostics
  FOR SELECT
  TO service_role
  USING (true);

-- Admins can view all
CREATE POLICY "Admins can view detailed diagnostics"
  ON public.detailed_diagnostics
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Unique constraint: one diagnostic per intake
CREATE UNIQUE INDEX idx_detailed_diagnostics_intake_id ON public.detailed_diagnostics(intake_id);

-- Trigger for updated_at
CREATE TRIGGER update_detailed_diagnostics_updated_at
  BEFORE UPDATE ON public.detailed_diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
