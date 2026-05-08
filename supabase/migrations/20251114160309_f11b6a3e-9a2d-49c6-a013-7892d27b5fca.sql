-- Add helpful comments to existing tables (metadata only, no functional changes)

COMMENT ON TABLE public.leads IS 'Stores contact information for potential clients who use the calculators';

COMMENT ON TABLE public.dime_reports IS 'Stores generated DIME (Debt, Income, Mortgage, Education) protection reports';

COMMENT ON TABLE public.fin_reports IS 'Stores generated FIN (Financial Independence Number) calculator reports';

COMMENT ON TABLE public.user_roles IS 'Maps users to their roles (admin, etc.) for access control';