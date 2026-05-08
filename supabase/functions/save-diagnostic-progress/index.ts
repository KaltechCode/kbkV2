import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sha256Hex } from "../_shared/resumeToken.ts";
import { checkRateLimit, getClientIP } from "../_shared/rateLimit.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Lightweight step-based autosave for the Detailed Diagnostic wizard.
// Authenticated by the same 60-min session_token used by process-detailed-diagnostic.
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const intakeId = typeof body?.intake_id === "string" ? body.intake_id : "";
    const sessionToken = typeof body?.session_token === "string" ? body.session_token : "";
    const wizardData = body?.wizard_data;
    const currentStep = Number.isFinite(body?.current_step) ? Number(body.current_step) : 0;

    if (!intakeId || !UUID_RE.test(intakeId)) {
      return new Response(
        JSON.stringify({ error: "intake_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!sessionToken || sessionToken.length < 32) {
      return new Response(
        JSON.stringify({ error: "session_token is required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!wizardData || typeof wizardData !== "object") {
      return new Response(
        JSON.stringify({ error: "wizard_data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Rate limit per intake to prevent abuse (step-based saves should be infrequent)
    const limit = checkRateLimit(
      intakeId,
      { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: "save_progress_intake" },
      corsHeaders,
    );
    if (limit) return limit;

    const ipLimit = checkRateLimit(
      getClientIP(req),
      { windowMs: 60 * 1000, maxRequests: 60, keyPrefix: "save_progress_ip" },
      corsHeaders,
    );
    if (ipLimit) return ipLimit;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const tokenHash = await sha256Hex(sessionToken);

    const { data: intake, error: lookupErr } = await supabase
      .from("financial_stress_test_intakes")
      .select("id, session_token_hash, session_token_expires_at")
      .eq("id", intakeId)
      .maybeSingle();

    if (lookupErr || !intake) {
      return new Response(
        JSON.stringify({ error: "Intake not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!intake.session_token_hash || intake.session_token_hash !== tokenHash) {
      return new Response(
        JSON.stringify({ error: "Invalid session." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (intake.session_token_expires_at && new Date(intake.session_token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Session expired." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: updErr } = await supabase
      .from("financial_stress_test_intakes")
      .update({
        intake_progress: {
          wizard_data: wizardData,
          current_step: currentStep,
          updated_at: new Date().toISOString(),
        },
      })
      .eq("id", intakeId);

    if (updErr) {
      console.error("save-diagnostic-progress update error:", updErr);
      return new Response(
        JSON.stringify({ error: "Failed to save progress." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("save-diagnostic-progress unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
