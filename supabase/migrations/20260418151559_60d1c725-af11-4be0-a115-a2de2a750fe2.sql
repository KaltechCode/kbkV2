-- Helper: lets the edge function (running with service role) seed the vault secret.
CREATE OR REPLACE FUNCTION public.seed_abandonment_cron_secret(_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_existing uuid;
BEGIN
  IF _key IS NULL OR length(_key) < 20 THEN
    RAISE EXCEPTION 'invalid key';
  END IF;

  SELECT id INTO v_existing FROM vault.secrets WHERE name = 'abandonment_cron_service_role_key';
  IF v_existing IS NULL THEN
    PERFORM vault.create_secret(_key, 'abandonment_cron_service_role_key', 'Service role key for detect-abandonment cron');
  ELSE
    PERFORM vault.update_secret(v_existing, _key, 'abandonment_cron_service_role_key', 'Service role key for detect-abandonment cron');
  END IF;
END $$;

-- Only the service role may call this (edge functions use service role).
REVOKE ALL ON FUNCTION public.seed_abandonment_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.seed_abandonment_cron_secret(text) TO service_role;