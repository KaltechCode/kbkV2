import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { buildUnifiedEmail } from "../_shared/emailTemplate.ts";
import {
  buildResumeFooterHtml,
  buildResumeTokenRecord,
} from "../_shared/resumeToken.ts";
import { AppConfig } from "../_shared/appConfig.ts";
import {
  getClientIP,
  applyRateLimits,
  resetRateLimit,
} from "../_shared/rateLimit.ts";
import {
  verifyTurnstileToken,
  turnstileErrorResponse,
} from "../_shared/turnstile.ts";

import clients from "../_shared/emailClient.ts";

const MAX_OTP_ATTEMPTS = 5;

// Generic, indistinguishable failure message for all verify_code failure modes
// (no active OTP, expired, wrong code, locked). This prevents attackers from
// enumerating intake/OTP state via response strings.
const GENERIC_VERIFY_FAILURE =
  "Invalid or expired code. Please request a new one or try again.";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action;
    const email = body.email?.trim?.()?.toLowerCase?.();
    const turnstileToken = body.turnstile_token;

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Turnstile bot protection (both actions) ───
    const clientIP = getClientIP(req);
    if (!turnstileToken || typeof turnstileToken !== "string") {
      return turnstileErrorResponse(
        "Bot verification failed. Please refresh and try again.",
        corsHeaders,
      );
    }
    const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIP);
    if (!turnstileValid) {
      return turnstileErrorResponse(
        "Bot verification failed. Please refresh and try again.",
        corsHeaders,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ─── PHASE 1: Send OTP code ───
    if (action === "send_code") {
      // Rate limit: per-IP 5 / 10 min, per-email 3 / hour
      const sendLimitResponse = applyRateLimits(
        [
          {
            key: clientIP,
            config: {
              windowMs: 10 * 60 * 1000,
              maxRequests: 5,
              keyPrefix: "diag_otp_send_ip",
            },
          },
          {
            key: email,
            config: {
              windowMs: 60 * 60 * 1000,
              maxRequests: 3,
              keyPrefix: "diag_otp_send_email",
            },
          },
        ],
        corsHeaders,
      );
      if (sendLimitResponse) return sendLimitResponse;

      // Check if a paid intake exists for this email
      const { data: intake, error: dbError } = await supabase
        .from("financial_stress_test_intakes")
        .select("id")
        .ilike("email", email)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) {
        console.error("DB error:", dbError);
        return new Response(
          JSON.stringify({ error: "An error occurred. Please try again." }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Always return code_sent: true to prevent email enumeration
      if (!intake) {
        return new Response(JSON.stringify({ code_sent: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate 6-digit OTP
      const otpArray = new Uint32Array(1);
      crypto.getRandomValues(otpArray);
      const otp = String(otpArray[0] % 1000000).padStart(6, "0");

      // Hash and store
      const otpHash = await sha256(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      // Mint fresh resume token so OTP email can also carry a recovery link
      const resumeRecord = await buildResumeTokenRecord();
      const { error: updateError } = await supabase
        .from("financial_stress_test_intakes")
        .update({
          diagnostic_otp_hash: otpHash,
          diagnostic_otp_expires_at: expiresAt,
          diagnostic_otp_attempts: 0,
          resume_token_hash: resumeRecord.tokenHash,
          resume_token_last4: resumeRecord.last4,
          resume_token_expires_at: resumeRecord.expiresAt,
        })
        .eq("id", intake.id);

      if (updateError) {
        console.error("Update error:", updateError);
        return new Response(
          JSON.stringify({ error: "An error occurred. Please try again." }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Send OTP via deon mail

      const emailFrom = Deno.env.get("EMAIL_FROM");

      if (clients) {
        try {
          const sentEmail = await clients.send({
            from: emailFrom ?? "",
            to: email,
            subject: "Your Verification Code — KB&K Financial Diagnostic",
            replyTo: AppConfig.EMAIL_REPLY_TO,
            html: buildUnifiedEmail({
              headerSubtitle: "VERIFICATION REQUIRED",
              contextStatement:
                "Use the code below to access your Detailed Financial Diagnostic.",
              cardContent: `
                  <p style="color:#718096;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px 0;text-align:center;font-weight:600;">Your Verification Code</p>
                  <p style="font-size:42px;font-weight:800;color:#0A2240;letter-spacing:8px;font-family:'Courier New',monospace;margin:0;text-align:center;">${otp}</p>
                  <p style="color:#D97706;font-size:13px;font-weight:600;margin:12px 0 0 0;text-align:center;">⏱ This code expires in 10 minutes</p>
                `,
              secondaryText: `If you didn't request this code, you can safely ignore this email.${buildResumeFooterHtml(resumeRecord.rawToken, req)}`,
            }),
          });
          console.log("Email sent:", sentEmail);
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
        }
      }

      return new Response(JSON.stringify({ code_sent: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── PHASE 2: Verify OTP code ───
    if (action === "verify_code") {
      // Rate limit: per-IP 10/min, per-email 5 attempts / 10 min OTP window
      const verifyLimitResponse = applyRateLimits(
        [
          {
            key: clientIP,
            config: {
              windowMs: 60 * 1000,
              maxRequests: 10,
              keyPrefix: "diag_otp_verify_ip",
            },
          },
          {
            key: email,
            config: {
              windowMs: 10 * 60 * 1000,
              maxRequests: 5,
              keyPrefix: "diag_otp_verify_email",
            },
          },
        ],
        corsHeaders,
      );
      if (verifyLimitResponse) return verifyLimitResponse;

      const code = body.code?.trim?.();

      if (!code || typeof code !== "string" || code.length !== 6) {
        return new Response(
          JSON.stringify({ error: "A valid 6-digit code is required." }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const { data: intake, error: dbError } = await supabase
        .from("financial_stress_test_intakes")
        .select(
          "id, diagnostic_otp_hash, diagnostic_otp_expires_at, diagnostic_otp_attempts, first_name, last_name, email, phone, marital_status, number_of_children, primary_concern, annual_income, monthly_expenses, mortgage_balance, consumer_debt, life_insurance_coverage",
        )
        .ilike("email", email)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Diagnostic logging
      console.log("[verify_code] Intake found:", !!intake);
      console.log(
        "[verify_code] OTP hash exists:",
        !!intake?.diagnostic_otp_hash,
      );
      console.log(
        "[verify_code] OTP expires_at:",
        intake?.diagnostic_otp_expires_at,
      );
      if (intake?.diagnostic_otp_expires_at) {
        console.log(
          "[verify_code] Expired:",
          new Date(intake.diagnostic_otp_expires_at) < new Date(),
        );
      }

      if (dbError) {
        console.error("DB error:", dbError);
        return new Response(
          JSON.stringify({ error: "An error occurred. Please try again." }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (
        !intake ||
        !intake.diagnostic_otp_hash ||
        !intake.diagnostic_otp_expires_at
      ) {
        return new Response(
          JSON.stringify({ verified: false, error: GENERIC_VERIFY_FAILURE }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Hard lockout after MAX_OTP_ATTEMPTS failed attempts (pre-check on read value).
      // The atomic RPC below is the authoritative enforcement point under concurrency.
      if ((intake.diagnostic_otp_attempts ?? 0) >= MAX_OTP_ATTEMPTS) {
        // Defensive: ensure OTP is cleared (idempotent if already cleared by RPC)
        await supabase
          .from("financial_stress_test_intakes")
          .update({
            diagnostic_otp_hash: null,
            diagnostic_otp_expires_at: null,
          })
          .eq("id", intake.id);
        return new Response(
          JSON.stringify({ verified: false, error: GENERIC_VERIFY_FAILURE }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Check expiration
      const expiresAt = new Date(intake.diagnostic_otp_expires_at);
      if (expiresAt < new Date()) {
        return new Response(
          JSON.stringify({ verified: false, error: GENERIC_VERIFY_FAILURE }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Compare hashes
      const codeHash = await sha256(code);
      const hashMatch = secureCompare(codeHash, intake.diagnostic_otp_hash);
      console.log("[verify_code] Hash comparison result:", hashMatch);
      if (!hashMatch) {
        // ATOMIC increment via SECURITY DEFINER RPC. This is race-safe: under
        // concurrent wrong-code submissions, the database serializes the
        // UPDATE ... SET attempts = COALESCE(attempts,0) + 1 RETURNING attempts
        // so each request sees a strictly-monotonic post-increment count and
        // the lockout threshold cannot be crossed without OTP being nulled.
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "increment_diagnostic_otp_attempt",
          { _intake_id: intake.id, _max_attempts: MAX_OTP_ATTEMPTS },
        );
        if (rpcError) {
          console.error("OTP attempt RPC error:", rpcError);
        } else {
          console.log("[verify_code] Atomic increment result:", rpcData);
        }
        return new Response(
          JSON.stringify({ verified: false, error: GENERIC_VERIFY_FAILURE }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Hash matched — but a concurrent wrong-attempt RPC could have just
      // crossed the lockout threshold and nulled the OTP. Re-read attempts
      // to ensure we never issue a session_token after lockout was reached.
      const { data: postCheck } = await supabase
        .from("financial_stress_test_intakes")
        .select("diagnostic_otp_attempts, diagnostic_otp_hash")
        .eq("id", intake.id)
        .maybeSingle();
      if (
        !postCheck ||
        postCheck.diagnostic_otp_hash === null ||
        (postCheck.diagnostic_otp_attempts ?? 0) >= MAX_OTP_ATTEMPTS
      ) {
        return new Response(
          JSON.stringify({ verified: false, error: GENERIC_VERIFY_FAILURE }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Generate a session token for downstream submission auth
      const tokenBytes = new Uint8Array(64);
      crypto.getRandomValues(tokenBytes);
      const sessionToken = Array.from(tokenBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const sessionTokenHash = await sha256(sessionToken);
      const sessionTokenExpiresAt = new Date(
        Date.now() + 60 * 60 * 1000,
      ).toISOString(); // 60 min

      // Clear OTP and store session token (single-use OTP, fresh session token)
      await supabase
        .from("financial_stress_test_intakes")
        .update({
          diagnostic_otp_hash: null,
          diagnostic_otp_expires_at: null,
          diagnostic_otp_attempts: 0,
          session_token_hash: sessionTokenHash,
          session_token_expires_at: sessionTokenExpiresAt,
        })
        .eq("id", intake.id);

      // Reset per-email verify rate limit on success
      resetRateLimit(email, "diag_otp_verify_email");

      return new Response(
        JSON.stringify({
          verified: true,
          intake_id: intake.id,
          session_token: sessionToken,
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
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Unknown action
    return new Response(
      JSON.stringify({
        error: "Invalid action. Use 'send_code' or 'verify_code'.",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
