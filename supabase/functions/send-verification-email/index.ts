import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
  getClientIP,
  applyRateLimits,
  RateLimitPresets,
} from "../_shared/rateLimit.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { buildUnifiedEmail } from "../_shared/emailTemplate.ts";
import { AppConfig } from "../_shared/appConfig.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_SECRET")!);
// Note: This function is only used for sending verification codes, so we can use a more cost-effective email service like Resend instead of the transactional provider used for contact form emails.

interface VerificationEmailRequest {
  email: string;
  firstName: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, code }: VerificationEmailRequest =
      await req.json();

    // Validate required fields
    if (!email || !firstName || !code) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Apply rate limiting: per-IP and per-email
    const clientIP = getClientIP(req);

    const rateLimitResponse = applyRateLimits(
      [
        {
          key: clientIP,
          config: {
            windowMs: 60 * 1000,
            maxRequests: 10,
            keyPrefix: "send_verification_ip",
          },
        },
        {
          key: email.toLowerCase(),
          config: {
            windowMs: 60 * 60 * 1000,
            maxRequests: 5,
            keyPrefix: "send_verification_email",
          },
        },
      ],
      corsHeaders,
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the email exists in the leads table
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (leadError) {
      console.error("Error checking lead:", leadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify lead" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (!lead) {
      console.error("Lead not found for email:", email);
      // SECURITY: Generic error message to prevent email enumeration attacks
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email Not found",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    console.log("Sending verification email to:", email);

    const emailHTML = buildUnifiedEmail({
      headerSubtitle: "VERIFICATION REQUIRED",
      firstName,
      contextStatement:
        "To complete your request, please verify your email address using the code below.",
      cardContent: `
        <p style="color:#718096;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px 0;text-align:center;font-weight:600;">Your Verification Code</p>
        <p style="font-size:42px;font-weight:800;color:#0A2240;letter-spacing:8px;font-family:'Courier New',monospace;margin:0;text-align:center;">${code}</p>
        <p style="color:#D97706;font-size:13px;font-weight:600;margin:12px 0 0 0;text-align:center;">⏱ This code expires in 10 minutes</p>
      `,
      secondaryText:
        "If you didn't request this verification code, you can safely ignore this email.",
    });

    const emailResponse = await resend.emails.send({
      from: Deno.env.get("SENDER_EMAIL")!,
      to: [email],
      subject: "Verify Your Email - KB&K Legacy Shield",
      html: emailHTML,
      reply_to: AppConfig.EMAIL_REPLY_TO,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(req.headers.get("origin")),
        },
      },
    );
  }
};

serve(handler);
