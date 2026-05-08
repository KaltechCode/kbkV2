import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getClientIP, applyRateLimits, RateLimitPresets } from "../_shared/rateLimit.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

// Simple in-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(email);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  record.count++;
  return true;
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Verify Cloudflare Turnstile token
async function verifyTurnstileToken(token: string, remoteip?: string): Promise<boolean> {
  const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");
  
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteip) {
      formData.append("remoteip", remoteip);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await response.json();
    
    // Log for debugging (without exposing the token)
    console.log("Turnstile verification result:", { success: result.success, errorCodes: result["error-codes"] });
    
    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, phone, email, turnstile_token } = await req.json();

    // SECURITY: Verify Turnstile token FIRST before any other processing
    if (!turnstile_token) {
      return new Response(
        JSON.stringify({ error: "Verification required. Please complete the security check." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientIP = getClientIP(req);
    const turnstileValid = await verifyTurnstileToken(turnstile_token, clientIP);
    
    if (!turnstileValid) {
      return new Response(
        JSON.stringify({ error: "Verification failed. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Apply rate limiting: per-IP and per-email (after Turnstile verification)
    const rateLimitResponse = applyRateLimits([
      {
        key: clientIP,
        config: { ...RateLimitPresets.STANDARD, keyPrefix: 'create_lead_ip' }
      },
      {
        key: email.toLowerCase(),
        config: { ...RateLimitPresets.HOURLY_STRICT, keyPrefix: 'create_lead_email' }
      }
    ], corsHeaders);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim() || !email?.trim()) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone format
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit
    const normalizedEmail = email.trim().toLowerCase();
    if (!checkRateLimit(normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate verification code
    const code = generateVerificationCode();
    const hashedCode = await hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Get current user if authenticated
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabaseClient.auth.getUser();
      userId = user?.id || null;
    }

    // Create or update lead
    const { data: lead, error: upsertError } = await supabaseAdmin
      .from("leads")
      .upsert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: normalizedEmail,
        email_verified: false,
        verification_code_hash: hashedCode,
        verification_code_expires_at: expiresAt.toISOString(),
        user_id: userId,
      }, {
        onConflict: "email"
      })
      .select()
      .single();

    if (upsertError) {
      console.error("Error creating lead:", upsertError);
      throw new Error("Failed to save lead information");
    }

    // Send verification email
    const { error: emailError } = await supabaseAdmin.functions.invoke("send-verification-email", {
      body: {
        email: normalizedEmail,
        firstName: firstName.trim(),
        code: code,
      },
    });

    if (emailError) {
      console.error("Error sending verification email:", emailError);
      throw new Error("Failed to send verification email");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: "Verification code sent to your email"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in create-lead function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
