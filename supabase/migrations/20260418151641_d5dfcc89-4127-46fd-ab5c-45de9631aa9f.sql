SELECT net.http_post(
  url := 'https://aiwvuwgdkkeotrpfztkj.supabase.co/functions/v1/detect-abandonment',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || (
      SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'abandonment_cron_service_role_key' LIMIT 1
    )
  ),
  body := jsonb_build_object('trigger', 'manual-verify')
) AS request_id;