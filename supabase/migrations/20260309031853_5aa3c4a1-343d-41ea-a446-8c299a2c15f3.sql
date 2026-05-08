ALTER TABLE public.detailed_diagnostics
  ADD COLUMN client_first_name text,
  ADD COLUMN client_last_name text,
  ADD COLUMN client_email text,
  ADD COLUMN client_phone text,
  ADD COLUMN marital_status text,
  ADD COLUMN primary_concern text;