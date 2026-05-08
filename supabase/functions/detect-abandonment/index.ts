import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { buildUnifiedEmail } from "../_shared/emailTemplate.ts";
import {
  buildResumeFooterHtml,
  buildResumeTokenRecord,
  buildResumeUrl,
} from "../_shared/resumeToken.ts";
import { AppConfig } from "../_shared/appConfig.ts";
import clients from "../_shared/emailClient.ts";

// Detect users who paid, started the Detailed Diagnostic, and went idle for 45+ minutes.
// Sends a one-time recovery email with a fresh 7-day resume link.
//
// Triggered by pg_cron every 15 minutes. The cron job pulls the service role
// key from the `abandonment_cron_service_role_key` vault secret and sends it
// as the Authorization bearer.
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const runStartedAt = Date.now();

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey);

  // Strict service-role bearer check.
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const cutoffIso = new Date(Date.now() - 45 * 60 * 1000).toISOString();

  // Pull paid intakes with saved progress that haven't been notified yet.
  // We filter `intake_progress.updated_at` client-side because it's a JSONB field.
  const { data: candidates, error: queryErr } = await supabase
    .from("financial_stress_test_intakes")
    .select("id, first_name, email, intake_progress")
    .eq("payment_status", "paid")
    .eq("abandonment_email_sent", false)
    .not("intake_progress", "is", null)
    .limit(100);

  if (queryErr) {
    console.error("detect-abandonment query error:", queryErr);
    return new Response(JSON.stringify({ error: "Query failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!clients) {
    console.error("Deno mailer not configured");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const fromAddress = Deno.env.get("EMAIL_FROM")!;
  const replyTo = AppConfig.EMAIL_REPLY_TO;

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const intake of candidates ?? []) {
    processed++;

    // Safety checks
    const progress = (intake.intake_progress ?? {}) as Record<string, unknown>;
    const progressUpdatedAt =
      typeof progress.updated_at === "string" ? progress.updated_at : null;

    if (!progressUpdatedAt || !intake.email) {
      skipped++;
      continue;
    }
    if (new Date(progressUpdatedAt).toISOString() > cutoffIso) {
      // Updated more recently than the 45-min threshold
      skipped++;
      continue;
    }
    // Empty progress check: if wizard_data is missing or has no keys, skip
    const wizardData = (progress as { wizard_data?: Record<string, unknown> })
      .wizard_data;
    if (
      !wizardData ||
      typeof wizardData !== "object" ||
      Object.keys(wizardData).length === 0
    ) {
      skipped++;
      continue;
    }

    // Atomically claim this intake to prevent duplicate sends across overlapping cron runs.
    const { data: claimed, error: claimErr } = await supabase
      .from("financial_stress_test_intakes")
      .update({ abandonment_email_sent: true })
      .eq("id", intake.id)
      .eq("abandonment_email_sent", false)
      .select("id")
      .maybeSingle();

    if (claimErr || !claimed) {
      skipped++;
      continue;
    }

    // Mint a fresh 7-day resume token (overwrites any prior one).
    let resumeRawToken: string | null = null;
    try {
      const resumeRecord = await buildResumeTokenRecord();
      const { error: tokenErr } = await supabase
        .from("financial_stress_test_intakes")
        .update({
          resume_token_hash: resumeRecord.tokenHash,
          resume_token_last4: resumeRecord.last4,
          resume_token_expires_at: resumeRecord.expiresAt,
        })
        .eq("id", intake.id);
      if (tokenErr) throw tokenErr;
      resumeRawToken = resumeRecord.rawToken;
    } catch (err) {
      console.error(`Token mint failed for ${intake.id}:`, err);
      // Roll back claim so a future run can retry
      await supabase
        .from("financial_stress_test_intakes")
        .update({ abandonment_email_sent: false })
        .eq("id", intake.id);
      errors.push(`token:${intake.id}`);
      continue;
    }

    const resumeUrl = buildResumeUrl(resumeRawToken, req);

    const cardContent = `
      <p style="color:#0A2240;font-size:22px;font-weight:700;margin:0 0 12px 0;text-align:center;line-height:1.3;">
        You're closer than you think
      </p>
      <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0;text-align:center;">
        It looks like you stepped away before completing your Financial Stress Test. No problem &ndash; we&rsquo;ve saved your progress.
      </p>
    `;

    const emailHtml = buildUnifiedEmail({
      headerSubtitle: "PICK UP WHERE YOU LEFT OFF",
      firstName: intake.first_name ?? "there",
      contextStatement:
        "Your Detailed Diagnostic is still in progress and we&rsquo;ve safely held your place. Whenever you&rsquo;re ready, you can continue exactly where you stopped.",
      cardContent,
      interpretation:
        "Completing the assessment unlocks your full Gap &amp; Exposure Report &ndash; the structured breakdown you started this process to receive.",
      ctaText: "Continue My Assessment",
      ctaUrl: resumeUrl,
      secondaryText: `Your saved answers will be restored automatically when you open the link.${buildResumeFooterHtml(resumeRawToken, req)}`,
    });

    try {
      await clients.send({
        from: fromAddress,
        to: [intake.email],
        subject: "You're almost done — pick up where you left off",
        html: emailHtml,
        reply_to: replyTo,
      });
      sent++;
    } catch (sendErr) {
      console.error(`Email send failed for ${intake.id}:`, sendErr);
      // Roll back claim so it can retry next cycle
      await supabase
        .from("financial_stress_test_intakes")
        .update({ abandonment_email_sent: false })
        .eq("id", intake.id);
      errors.push(`send:${intake.id}`);
    }
  }

  console.log(
    `detect-abandonment: processed=${processed} sent=${sent} skipped=${skipped} errors=${errors.length}`,
  );

  // Persist run summary so the admin dashboard can monitor recovery email health.
  try {
    await supabase.from("abandonment_run_logs").insert({
      processed,
      sent,
      skipped,
      errors: errors.length,
      error_details: errors.length > 0 ? { items: errors } : null,
      duration_ms: Date.now() - runStartedAt,
    });
  } catch (logErr) {
    console.error("Failed to persist abandonment run log:", logErr);
  }

  return new Response(
    JSON.stringify({ success: true, processed, sent, skipped, errors }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
