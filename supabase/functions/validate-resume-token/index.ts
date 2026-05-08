import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sha256Hex } from "../_shared/resumeToken.ts";
import { checkRateLimit, getClientIP } from "../_shared/rateLimit.ts";

// Generate a fresh 60-min session token (raw + hash) so the resume link
// can hand off to the existing detailed-diagnostic submission flow.
function generateSessionToken(): string {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!token || token.length < 32 || token.length > 256) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid resume link." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Rate-limit by IP to deter token brute-forcing
    const clientIP = getClientIP(req);
    const ipLimit = checkRateLimit(
      clientIP,
      { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: "resume_token_ip" },
      corsHeaders,
    );
    if (ipLimit) return ipLimit;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const tokenHash = await sha256Hex(token);

    const { data: intake, error: dbErr } = await supabase
      .from("financial_stress_test_intakes")
      .select(
        "id, first_name, last_name, email, phone, marital_status, number_of_children, primary_concern, annual_income, monthly_expenses, mortgage_balance, consumer_debt, life_insurance_coverage, payment_status, intake_progress, resume_token_expires_at",
      )
      .eq("resume_token_hash", tokenHash)
      .maybeSingle();

    if (dbErr) {
      console.error("validate-resume-token DB error:", dbErr);
      return new Response(
        JSON.stringify({ valid: false, error: "An unexpected error occurred." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!intake) {
      return new Response(
        JSON.stringify({ valid: false, error: "This link is no longer valid. Please restart your assessment." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (intake.resume_token_expires_at && new Date(intake.resume_token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({
          valid: false,
          expired: true,
          email: intake.email,
          error: "This link has expired. Please request a new resume link.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Mint a fresh 60-min session token so the diagnostic form can authenticate submissions.
    const sessionToken = generateSessionToken();
    const sessionTokenHash = await sha256Hex(sessionToken);
    const sessionTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error: updErr } = await supabase
      .from("financial_stress_test_intakes")
      .update({
        session_token_hash: sessionTokenHash,
        session_token_expires_at: sessionTokenExpiresAt,
      })
      .eq("id", intake.id);

    if (updErr) {
      console.error("validate-resume-token session update error:", updErr);
      return new Response(
        JSON.stringify({ valid: false, error: "An unexpected error occurred." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        intake_id: intake.id,
        session_token: sessionToken,
        payment_status: intake.payment_status,
        intake_progress: intake.intake_progress ?? null,
        prefill: {
          first_name: intake.first_name,
          last_name: intake.last_name,
          email: intake.email,
          phone: intake.phone,
          marital_status: intake.marital_status,
          number_of_children: intake.number_of_children,
          primary_concern: intake.primary_concern,
          annual_income: intake.annual_income,
          monthly_expenses: intake.monthly_expenses,
          mortgage_balance: intake.mortgage_balance,
          consumer_debt: intake.consumer_debt,
          life_insurance_coverage: intake.life_insurance_coverage,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("validate-resume-token unexpected error:", err);
    return new Response(
      JSON.stringify({ valid: false, error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
