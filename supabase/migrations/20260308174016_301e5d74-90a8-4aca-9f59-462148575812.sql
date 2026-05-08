
-- Add individual pillar score columns
ALTER TABLE public.detailed_diagnostics
  ADD COLUMN income_score numeric DEFAULT 0,
  ADD COLUMN liquidity_score numeric DEFAULT 0,
  ADD COLUMN protection_score numeric DEFAULT 0,
  ADD COLUMN retirement_score numeric DEFAULT 0;

-- Add individual ratio columns
ALTER TABLE public.detailed_diagnostics
  ADD COLUMN actual_coverage numeric DEFAULT 0,
  ADD COLUMN required_coverage numeric DEFAULT 0,
  ADD COLUMN protection_ratio_value numeric DEFAULT 0,
  ADD COLUMN debt_ratio_value numeric DEFAULT 0,
  ADD COLUMN total_debt numeric DEFAULT 0,
  ADD COLUMN essential_expense_ratio numeric DEFAULT 0,
  ADD COLUMN liquidity_months numeric DEFAULT 0,
  ADD COLUMN required_retirement_capital numeric DEFAULT 0,
  ADD COLUMN retirement_funding_ratio numeric DEFAULT 0;

-- Add report timestamp
ALTER TABLE public.detailed_diagnostics
  ADD COLUMN report_generated_at timestamp with time zone DEFAULT NULL;

-- Migrate existing data from JSON to new columns
UPDATE public.detailed_diagnostics SET
  income_score = COALESCE((pillar_scores->>'income')::numeric, 0),
  liquidity_score = COALESCE((pillar_scores->>'liquidity')::numeric, 0),
  protection_score = COALESCE((pillar_scores->>'protection')::numeric, 0),
  retirement_score = COALESCE((pillar_scores->>'retirement')::numeric, 0),
  actual_coverage = COALESCE((ratios->>'actual_coverage')::numeric, 0),
  required_coverage = COALESCE((ratios->>'required_coverage')::numeric, 0),
  protection_ratio_value = COALESCE((ratios->>'protection_ratio')::numeric, 0),
  debt_ratio_value = COALESCE((ratios->>'debt_ratio')::numeric, 0),
  total_debt = COALESCE((ratios->>'total_debt')::numeric, 0),
  essential_expense_ratio = COALESCE((ratios->>'essential_expense_ratio')::numeric, 0),
  liquidity_months = COALESCE((ratios->>'liquidity_months')::numeric, 0),
  required_retirement_capital = COALESCE((ratios->>'required_retirement_capital')::numeric, 0),
  retirement_funding_ratio = COALESCE((ratios->>'retirement_funding_ratio')::numeric, 0)
WHERE pillar_scores IS NOT NULL OR ratios IS NOT NULL;

-- Drop JSON columns
ALTER TABLE public.detailed_diagnostics
  DROP COLUMN pillar_scores,
  DROP COLUMN ratios;
