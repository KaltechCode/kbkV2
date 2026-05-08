-- Create dime_reports table to store DIME calculator reports
CREATE TABLE IF NOT EXISTS public.dime_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  inputs_json JSONB NOT NULL,
  outputs_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dime_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for dime_reports
CREATE POLICY "Users can view their own DIME reports" 
ON public.dime_reports 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Service role can insert DIME reports" 
ON public.dime_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own DIME reports" 
ON public.dime_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dime_reports_updated_at
BEFORE UPDATE ON public.dime_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dime_reports_lead_id ON public.dime_reports(lead_id);
CREATE INDEX IF NOT EXISTS idx_dime_reports_email ON public.dime_reports(email);
CREATE INDEX IF NOT EXISTS idx_dime_reports_user_id ON public.dime_reports(user_id);