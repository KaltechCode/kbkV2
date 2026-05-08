import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getClientIP,
  applyRateLimits,
  RateLimitPresets,
} from "../_shared/rateLimit.ts";
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
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Verify Cloudflare Turnstile token
async function verifyTurnstileToken(
  token: string,
  remoteip?: string,
): Promise<boolean> {
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

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
    );

    const result = await response.json();

    // Log for debugging (without exposing the token)
    console.log("Turnstile verification result:", {
      success: result.success,
      errorCodes: result["error-codes"],
    });

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
    // Parse and validate request body
    let requestBody: Record<string, unknown>;
    try {
      const contentType = req.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(
          `Invalid Content-Type: ${contentType}. Expected application/json`,
        );
        // Still try to parse as JSON, but warn about it
      }

      const rawBody = await req.text();
      if (!rawBody.trim()) {
        return new Response(
          JSON.stringify({
            error: "Missing request body",
            details:
              "Request body must be valid JSON with Content-Type: application/json",
            example: {
              firstName: "John",
              lastName: "Doe",
              phone: "+1234567890",
              email: "john@example.com",
              turnstile_token: "token_here",
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const parsedBody = JSON.parse(rawBody);
      if (
        !parsedBody ||
        typeof parsedBody !== "object" ||
        Array.isArray(parsedBody)
      ) {
        return new Response(
          JSON.stringify({
            error: "Invalid request format",
            details: "Request body must be a JSON object",
            example: {
              firstName: "John",
              lastName: "Doe",
              phone: "+1234567890",
              email: "john@example.com",
              turnstile_token: "token_here",
            },
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      requestBody = parsedBody as Record<string, unknown>;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid request format",
          details:
            "Request body must be valid JSON with Content-Type: application/json",
          example: {
            firstName: "John",
            lastName: "Doe",
            phone: "+1234567890",
            email: "john@example.com",
            turnstile_token: "token_here",
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Destructure with validation
    const { firstName, lastName, phone, email, turnstile_token } = requestBody;

    // Validate that all required fields are provided
    const missingFields = [];
    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (!phone) missingFields.push("phone");
    if (!email) missingFields.push("email");
    // TEMPORARILY DISABLED FOR TESTING - turnstile_token is now optional
    // if (!turnstile_token) missingFields.push("turnstile_token");

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          missingFields: missingFields,
          required: [
            "firstName",
            "lastName",
            "phone",
            "email",
            // TEMPORARILY DISABLED FOR TESTING
            // "turnstile_token",
          ],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const clientIP = getClientIP(req);

    // SECURITY: Verify Turnstile token FIRST before any other processing
    // TEMPORARILY DISABLED FOR TESTING - REMOVE THIS IN PRODUCTION
    /*
    if (!turnstile_token) {
      return new Response(
        JSON.stringify({
          error: "Verification required. Please complete the security check.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const turnstileValid = await verifyTurnstileToken(
      turnstile_token,
      clientIP,
    );

    if (!turnstileValid) {
      return new Response(
        JSON.stringify({ error: "Verification failed. Please try again." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    */

    // Apply rate limiting: per-IP and per-email
    const rateLimitResponse = applyRateLimits(
      [
        {
          key: clientIP,
          config: { ...RateLimitPresets.STANDARD, keyPrefix: "create_lead_ip" },
        },
        {
          key: email.toLowerCase(),
          config: {
            ...RateLimitPresets.HOURLY_STRICT,
            keyPrefix: "create_lead_email",
          },
        },
      ],
      corsHeaders,
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate field values (trim and check)
    const trimmedFields = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
    };

    const emptyFields = Object.entries(trimmedFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Fields cannot be empty",
          emptyFields: emptyFields,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedFields.email)) {
      return new Response(
        JSON.stringify({
          error: "Invalid email format",
          received: trimmedFields.email,
          expected: "valid email address (e.g., user@example.com)",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate phone format
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    if (!phoneRegex.test(trimmedFields.phone)) {
      return new Response(
        JSON.stringify({
          error: "Invalid phone number format",
          received: trimmedFields.phone,
          expected:
            "Phone number with 10-15 digits (can include +, -, (), spaces)",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check rate limit
    const normalizedEmail = trimmedFields.email.toLowerCase();
    if (!checkRateLimit(normalizedEmail)) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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
        { global: { headers: { Authorization: authHeader } } },
      );
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      userId = user?.id || null;
    }

    // Create or update lead
    const { data: lead, error: upsertError } = await supabaseAdmin
      .from("leads")
      .upsert(
        {
          first_name: trimmedFields.firstName,
          last_name: trimmedFields.lastName,
          phone: trimmedFields.phone,
          email: normalizedEmail,
          email_verified: false,
          verification_code_hash: hashedCode,
          verification_code_expires_at: expiresAt.toISOString(),
          user_id: userId,
        },
        {
          onConflict: "email",
        },
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Error creating lead:", upsertError);
      throw new Error("Failed to save lead information");
    }

    // Send verification email
    const { error: emailError } = await supabaseAdmin.functions.invoke(
      "send-verification-email",
      {
        body: {
          email: normalizedEmail,
          firstName: trimmedFields.firstName,
          code: code,
        },
      },
    );

    if (emailError) {
      console.error("Error sending verification email:", emailError);
      throw new Error("Failed to send verification email");
    }

    return new Response(
      JSON.stringify({
        success: true,
        leadId: lead.id,
        message: "Verification code sent to your email",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in create-lead function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(req.headers.get("origin")),
          "Content-Type": "application/json",
        },
      },
    );
  }
};

serve(handler);
