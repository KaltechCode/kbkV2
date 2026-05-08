# Cron Jobs

This project uses Postgres `pg_cron` + `pg_net` to invoke Edge Functions on a
schedule. This document captures the conventions every cron job in this
project must follow so authentication failures don't silently degrade
features.

## Inventory

| Job name | Schedule | Function | Vault secret used |
|---|---|---|---|
| `detect-abandonment-every-15-min` | `*/15 * * * *` | `detect-abandonment` | `abandonment_cron_service_role_key` (with `email_queue_service_role_key`, `service_role_key` as fallbacks) |

Audited on 2026-04-18: this is the only active cron job. All recent ticks
succeeded.

## The "vault-secret-missing" failure pattern

Edge Functions invoked from cron must be authorized. We pass the project's
service role key as a `Bearer` token in the `Authorization` header. The key
is stored in `vault.secrets` and read via `vault.decrypted_secrets` at
invocation time:

```sql
SELECT net.http_post(
  url := 'https://<project>.supabase.co/functions/v1/<function>',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || (
      SELECT decrypted_secret
      FROM vault.decrypted_secrets
      WHERE name = '<secret_name>'
      LIMIT 1
    )
  ),
  body := jsonb_build_object('trigger', 'cron')
);
```

If the vault secret is missing or rotated, the subquery returns `NULL`, the
header becomes `Bearer ` (empty), and the Edge Function returns 401. The
cron run itself reports `succeeded` because the HTTP POST was dispatched —
the failure is invisible unless you inspect Edge Function logs or the
function's own run-log table.

## Required conventions for any new cron job

1. **Strict auth in the Edge Function.** Validate the bearer against
   `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` exactly. Never accept the
   anon key or skip the check.

2. **Fallback secret names.** Read the bearer from
   `vault.decrypted_secrets` using `WHERE name IN (...)` ordered by
   priority. This makes rotations and renames safe.

3. **Persist run summaries.** Insert a row into a dedicated
   `<feature>_run_logs` table at the end of every run with
   `processed/sent/skipped/errors/duration_ms`. This is the only reliable
   way to detect silent 401s — `cron.job_run_details` will say
   `succeeded` even when the function returned 401.

4. **Surface runs in admin UI.** Add a small widget on `/admin/leads` that
   reads the run log and shows recent activity, so operators notice
   regressions.

5. **Migrations vs. data ops.** Schedule the cron job using the
   `supabase--insert` tool (it contains the project URL and is not safe to
   replay during remixes). Do not put it in a migration file.

## Reference: scheduling syntax

```sql
SELECT cron.schedule(
  '<job-name>',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/<function>',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets
        WHERE name = '<secret_name>' LIMIT 1
      )
    ),
    body := jsonb_build_object('trigger', 'cron')
  );
  $$
);
```

To unschedule: `SELECT cron.unschedule('<job-name>');`

## Health checks

```sql
-- Recent dispatch results (always 'succeeded' for HTTP POST — see caveat above)
SELECT status, count(*), max(end_time) AS last_run
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = '<job-name>')
  AND start_time > now() - interval '24 hours'
GROUP BY status;

-- Real health from the function's own log table
SELECT date_trunc('hour', ran_at) AS hour,
       sum(processed) AS processed,
       sum(sent)      AS sent,
       sum(errors)    AS errors
FROM <feature>_run_logs
WHERE ran_at > now() - interval '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```
