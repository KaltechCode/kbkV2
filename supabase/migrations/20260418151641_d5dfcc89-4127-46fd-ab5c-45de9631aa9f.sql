DO $$
BEGIN
  IF to_regnamespace('net') IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://aiwvuwgdkkeotrpfztkj.supabase.co/functions/v1/detect-abandonment',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(
          (SELECT decrypted_secret
           FROM vault.decrypted_secrets
           WHERE name = 'abandonment_cron_service_role_key'
           LIMIT 1),
          ''
        )
      ),
      body := jsonb_build_object('trigger', 'manual-verify')
    );
  ELSE
    RAISE NOTICE 'Skipping net.http_post: schema "net" is not available in this environment.';
  END IF;
END
$$;
