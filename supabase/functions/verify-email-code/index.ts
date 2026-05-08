import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { getClientIP, applyRateLimits, resetRateLimit } from "../_shared/rateLimit.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { verifyTurnstileToken, turnstileErrorResponse } from "../_shared/turnstile.ts";

interface VerifyCodeRequest {
  email: string;
  code: string;
  turnstile_token?: string;
}

// Simple hash function for verification codes
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}


const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Unified generic error response for ALL OTP verification failures.
  // Never distinguish between wrong code, expired code, no code, missing lead,
  // or locked state — that information leaks signal to attackers.
  const GENERIC_OTP_ERROR =
    "Invalid or expired code. Please try again or request a new one.";
  const genericFailure = (status = 400) =>
    new Response(
      JSON.stringify({ verified: false, success: false, error: GENERIC_OTP_ERROR }),
      { status, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );

  try {
    // Parse request body once at the beginning
    const { email, code, turnstile_token }: VerifyCodeRequest = await req.json();
    
    if (!email || !code) {
      return genericFailure();
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return genericFailure();
    }

    // Validate code format (must be 6 digits)
    if (!/^\d{6}$/.test(code)) {
      return genericFailure();
    }

    // Turnstile verification
    const clientIP = getClientIP(req);
    if (!turnstile_token || typeof turnstile_token !== "string") {
      return turnstileErrorResponse("Bot verification failed. Please refresh and try again.", corsHeaders);
    }
    const turnstileValid = await verifyTurnstileToken(turnstile_token, clientIP);
    if (!turnstileValid) {
      return turnstileErrorResponse("Bot verification failed. Please refresh and try again.", corsHeaders);
    }

    // Apply rate limiting: per-IP (10/min) and per-email (10/hr)
    const ipRateLimitResponse = applyRateLimits([
      {
        key: clientIP,
        config: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'verify_code_ip' }
      },
      {
        key: email.toLowerCase(),
        config: { windowMs: 60 * 60 * 1000, maxRequests: 10, keyPrefix: 'verify_code_email' }
      }
    ], corsHeaders);
    
    if (ipRateLimitResponse) {
      return ipRateLimitResponse;
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);


    // Get the lead record
    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("id, email, first_name, last_name, verification_code_hash, verification_code_expires_at")
      .eq("email", email)
      .single();

    if (fetchError || !lead) {
      console.error("Lead not found or error:", fetchError);
      return genericFailure();
    }

    // Check if code is expired
    const expiresAt = new Date(lead.verification_code_expires_at);
    const currentTime = new Date();

    if (currentTime > expiresAt) {
      console.log("Code expired");
      return genericFailure();
    }

    // Hash the provided code and compare
    const hashedCode = await hashCode(code);

    if (hashedCode !== lead.verification_code_hash) {
      console.log(`Invalid code attempt for ${email}`);
      return genericFailure();
    }

    // Clear rate limit on successful verification
    resetRateLimit(email.toLowerCase(), 'verify_code_email');

    // Mark email as verified
    const { error: updateError } = await supabase
      .from("leads")
      .update({ 
        email_verified: true,
        verification_code_hash: null,
        verification_code_expires_at: null
      })
      .eq("id", lead.id);

    if (updateError) {
      console.error("Error updating lead:", updateError);
      throw updateError;
    }

    console.log("Email verified successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        verified: true,
        leadId: lead.id,
        email: lead.email,
        firstName: lead.first_name,
        lastName: lead.last_name
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error verifying code:", error);
    return genericFailure(500);
  }
};

serve(handler);
