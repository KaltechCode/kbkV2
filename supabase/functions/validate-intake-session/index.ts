import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Simple constant-time comparison to prevent timing attacks
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_token } = await req.json();

    if (!session_token || typeof session_token !== "string" || session_token.length < 32) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid session token." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Hash the provided token using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(session_token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Find intake record with matching token hash
    const { data: intake, error: dbError } = await supabase
      .from("financial_stress_test_intakes")
      .select("id, first_name, last_name, email, phone, marital_status, number_of_children, primary_concern, annual_income, monthly_expenses, mortgage_balance, consumer_debt, life_insurance_coverage, session_token_hash, session_token_expires_at")
      .eq("session_token_hash", tokenHash)
      .eq("payment_status", "paid")
      .limit(1)
      .maybeSingle();

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ valid: false, error: "An unexpected error occurred." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!intake) {
      return new Response(
        JSON.stringify({ valid: false, error: "Session not found or expired." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    const expiresAt = new Date(intake.session_token_expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: "Session has expired." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return only non-financial intake data for pre-fill
    return new Response(
      JSON.stringify({
        valid: true,
        intake_id: intake.id,
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
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ valid: false, error: "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
