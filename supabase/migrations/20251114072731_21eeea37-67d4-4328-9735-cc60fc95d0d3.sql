-- Drop the now-unused email-based access function
DROP FUNCTION IF EXISTS public.user_can_access_lead_by_email(text);