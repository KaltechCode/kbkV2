import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getClientIP, applyRateLimits, RateLimitPresets } from "../_shared/rateLimit.ts";
import { verifyTurnstileToken, turnstileErrorResponse } from "../_shared/turnstile.ts";
import { buildResumeTokenRecord } from "../_shared/resumeToken.ts";

// Generate cryptographically random token
function generateSecureToken(length = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Hash token using SHA-256
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      turnstile_token,
      first_name,
      last_name,
      email,
      phone,
      marital_status,
      number_of_children,
      primary_concern,
      annual_income,
      monthly_expenses,
      mortgage_balance,
      consumer_debt,
      life_insurance_coverage,
    } = body;

    // SECURITY: Verify Turnstile token FIRST
    if (!turnstile_token) {
      return turnstileErrorResponse("Verification required. Please complete the security check.", corsHeaders);
    }

    const clientIP = getClientIP(req);
    const turnstileValid = await verifyTurnstileToken(turnstile_token, clientIP);

    if (!turnstileValid) {
      return turnstileErrorResponse("Verification failed. Please try again.", corsHeaders);
    }

    // Apply rate limiting per IP (after Turnstile verification)
    const rateLimitResponse = applyRateLimits([
      { key: clientIP, config: { ...RateLimitPresets.STANDARD, keyPrefix: 'intake_ip' } },
    ], corsHeaders);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Basic validation
    if (
      !first_name || !last_name || !email || !phone ||
      !marital_status || !number_of_children || !primary_concern ||
      annual_income == null || monthly_expenses == null ||
      mortgage_balance == null || consumer_debt == null ||
      life_insurance_coverage == null
    ) {
      return new Response(
        JSON.stringify({ error: "All fields are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate session token (plain token returned to client, hash stored in DB)
    const sessionToken = generateSecureToken(64);
    const sessionTokenHash = await hashToken(sessionToken);
    // Token expires in 60 minutes
    const sessionTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Long-lived (7-day) resume token for email recovery links.
    const resumeRecord = await buildResumeTokenRecord();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("financial_stress_test_intakes")
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        marital_status,
        number_of_children,
        primary_concern,
        annual_income: Number(annual_income),
        monthly_expenses: Number(monthly_expenses),
        mortgage_balance: Number(mortgage_balance),
        consumer_debt: Number(consumer_debt),
        life_insurance_coverage: Number(life_insurance_coverage),
        session_token_hash: sessionTokenHash,
        session_token_expires_at: sessionTokenExpiresAt,
        resume_token_hash: resumeRecord.tokenHash,
        resume_token_last4: resumeRecord.last4,
        resume_token_expires_at: resumeRecord.expiresAt,
      })
      .select("id")
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save intake data." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fire-and-forget: trigger score calculation + email
    try {
      const scoreUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-stress-test-score`;
      fetch(scoreUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ intake_id: data.id, skip_payment_check: true }),
      }).catch((err) => console.error("Score trigger failed (non-blocking):", err));
    } catch (triggerErr) {
      console.error("Score trigger error (non-blocking):", triggerErr);
    }

    // Return the intake ID and session token (token is only returned once)
    return new Response(
      JSON.stringify({ id: data.id, session_token: sessionToken }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
