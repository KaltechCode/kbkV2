-- Create function to automatically set user_id for authenticated users
CREATE OR REPLACE FUNCTION public.set_lead_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is authenticated and user_id is not already set, set it to auth.uid()
  IF auth.uid() IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to execute the function before inserting leads
CREATE TRIGGER set_lead_user_id_trigger
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lead_user_id();