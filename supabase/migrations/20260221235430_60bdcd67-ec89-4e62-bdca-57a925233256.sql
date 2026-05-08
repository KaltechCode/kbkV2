
CREATE TABLE public.financial_stress_test_intakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  number_of_children TEXT NOT NULL,
  primary_concern TEXT NOT NULL,
  annual_income NUMERIC NOT NULL,
  monthly_expenses NUMERIC NOT NULL,
  mortgage_balance NUMERIC NOT NULL,
  consumer_debt NUMERIC NOT NULL,
  life_insurance_coverage NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  preliminary_score NUMERIC,
  preliminary_category TEXT
);

ALTER TABLE public.financial_stress_test_intakes ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service role) to insert
CREATE POLICY "Service role can insert intakes"
ON public.financial_stress_test_intakes
FOR INSERT
WITH CHECK (true);

-- Allow edge functions (service role) to update payment status
CREATE POLICY "Service role can update intakes"
ON public.financial_stress_test_intakes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow admins to view all intakes
CREATE POLICY "Admins can view all intakes"
ON public.financial_stress_test_intakes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
