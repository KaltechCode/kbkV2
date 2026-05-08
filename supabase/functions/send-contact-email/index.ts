import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  buildUnifiedEmail,
  buildAdminNotificationEmail,
} from "../_shared/emailTemplate.ts";
import {
  getClientIP,
  applyRateLimits,
  RateLimitPresets,
} from "../_shared/rateLimit.ts";
import {
  verifyTurnstileToken,
  turnstileErrorResponse,
} from "../_shared/turnstile.ts";
import { AppConfig } from "../_shared/appConfig.ts";
import {
  escapeHtml,
  escapeHtmlMultiline,
  isSafeEmailForHref,
} from "../_shared/escapeHtml.ts";
import clients from "../_shared/emailClient.ts";

const TAG = "[contact-form]";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message, turnstile_token } = await req.json();

    // SECURITY: Verify Turnstile token FIRST
    if (!turnstile_token) {
      return turnstileErrorResponse(
        "Verification required. Please complete the security check.",
        corsHeaders,
      );
    }

    const clientIP = getClientIP(req);
    const turnstileValid = await verifyTurnstileToken(
      turnstile_token,
      clientIP,
    );

    if (!turnstileValid) {
      return turnstileErrorResponse(
        "Verification failed. Please try again.",
        corsHeaders,
      );
    }

    // Apply rate limiting per IP and per email
    const rateLimitResponse = applyRateLimits(
      [
        {
          key: clientIP,
          config: { ...RateLimitPresets.STRICT, keyPrefix: "contact_ip" },
        },
        {
          key: email?.toLowerCase() || "",
          config: {
            ...RateLimitPresets.AUTH_OPERATION,
            keyPrefix: "contact_email",
          },
        },
      ],
      corsHeaders,
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Save to database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: contactRow, error: dbError } = await supabase
      .from("contact_messages")
      .insert({ name, email, phone: phone || null, message: message || null })
      .select("id")
      .single();

    if (dbError) {
      console.error(`${TAG} DB insert error:`, dbError);
      return new Response(JSON.stringify({ error: "Failed to save message" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const submissionId = contactRow?.id;

    // Helper: log email delivery
    async function logDelivery(
      emailType: string,
      recipient: string,
      status: "sent" | "failed",
      errorMessage?: string,
    ) {
      try {
        await supabase.from("email_delivery_logs").insert({
          submission_id: submissionId,
          email_type: emailType,
          recipient,
          status,
          error_message: errorMessage || null,
        });
      } catch (logErr) {
        console.error(`${TAG} Failed to write delivery log:`, logErr);
      }
    }

    // Send email via deno mailer
    const emailFrom = Deno.env.get("EMAIL_FROM")!;
    const emailReplyTo = AppConfig.EMAIL_REPLY_TO;

    // Format timestamp in Eastern Time
    const submittedAt =
      new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }) + " ET";

    const phoneDisplay = phone || "Not provided";
    const messageDisplay = message || "No message provided";

    // HTML-safe versions of every user-controlled field. Used ONLY inside
    // HTML template strings — the plain-text email body and the email
    // `subject` / `replyTo` fields keep the raw values.
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhoneDisplay = escapeHtml(phoneDisplay);
    const safeMessageDisplay = escapeHtmlMultiline(messageDisplay);

    // Only construct a mailto: link when the email passes strict validation.
    // Otherwise render the escaped value as plain text so an invalid/malicious
    // value cannot break out of the href attribute or create a clickable link.
    const emailCellHtml = isSafeEmailForHref(email)
      ? `<a href="mailto:${safeEmail}" style="color:#0A2240;text-decoration:none;">${safeEmail}</a>`
      : safeEmail;

    const internalHtml = buildAdminNotificationEmail({
      title: "New Contact Form Submission",
      subtitle: "ADMIN NOTIFICATION",
      bodyHtml: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;color:#333333;line-height:1.6;">
          <tr>
            <td style="padding:8px 0;font-weight:bold;width:120px;vertical-align:top;">Name:</td>
            <td style="padding:8px 0;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Email:</td>
            <td style="padding:8px 0;">${emailCellHtml}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Phone:</td>
            <td style="padding:8px 0;">${safePhoneDisplay}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Submitted:</td>
            <td style="padding:8px 0;">${submittedAt}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Source:</td>
            <td style="padding:8px 0;">KBKLegacyShield.com Contact Form</td>
          </tr>
        </table>
        <div style="margin-top:16px;">
          <p style="margin:0 0 8px 0;font-weight:bold;font-size:15px;color:#333333;">Message:</p>
          <div style="background-color:#F4F5F7;border:1px solid #E2E8F0;border-radius:8px;padding:16px;font-size:15px;color:#333333;line-height:1.6;">
            ${safeMessageDisplay}
          </div>
        </div>
      `,
    });

    const internalText = `New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phoneDisplay}
Submitted: ${submittedAt}
Source: KBKLegacyShield.com Contact Form

Message:
${messageDisplay}`;

    // --- Internal notification with retry ---
    let internalSent = false;
    let internalErrorMsg = "";

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const { error: emailError } = await clients.send({
          from: emailFrom,
          to: [emailReplyTo],
          replyTo: email,
          subject: `Contact Form — ${name} | ${email}`,
          html: internalHtml,
          text: internalText,
        });

        if (emailError) {
          internalErrorMsg =
            typeof emailError === "object"
              ? JSON.stringify(emailError)
              : String(emailError);
          console.error(
            `${TAG} Internal notification attempt ${attempt} failed:`,
            emailError,
          );
        } else {
          internalSent = true;
          console.log(
            `${TAG} Internal notification sent successfully (attempt ${attempt}).`,
          );
          break;
        }
      } catch (sendErr) {
        internalErrorMsg =
          sendErr instanceof Error ? sendErr.message : String(sendErr);
        console.error(
          `${TAG} Internal notification attempt ${attempt} exception:`,
          sendErr,
        );
      }
    }

    // Log internal delivery
    await logDelivery(
      "internal",
      emailReplyTo,
      internalSent ? "sent" : "failed",
      internalSent ? undefined : internalErrorMsg,
    );

    // If internal failed after retry, send system alert
    if (!internalSent) {
      console.error(
        `${TAG} CRITICAL: Internal notification failed after 2 attempts for submission ${submissionId}.`,
      );
      try {
        const alertHtml = buildAdminNotificationEmail({
          title: "⚠ SYSTEM ALERT: Internal Email Failed",
          subtitle: "CRITICAL",
          bodyHtml: `
            <p style="color:#333;font-size:14px;line-height:1.6;">The internal notification email for a contact form submission <strong>failed after 2 attempts</strong>.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
              <tr><td style="padding:4px 0;font-weight:bold;">Submission ID:</td><td>${submissionId}</td></tr>
              <tr><td style="padding:4px 0;font-weight:bold;">Name:</td><td>${safeName}</td></tr>
              <tr><td style="padding:4px 0;font-weight:bold;">Email:</td><td>${safeEmail}</td></tr>
              <tr><td style="padding:4px 0;font-weight:bold;">Phone:</td><td>${safePhoneDisplay}</td></tr>
              <tr><td style="padding:4px 0;font-weight:bold;">Submitted:</td><td>${submittedAt}</td></tr>
            </table>
            <p style="margin:16px 0 0;"><strong>Email Error:</strong></p>
            <div style="background:#F4F5F7;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:13px;word-break:break-all;">${escapeHtml(internalErrorMsg)}</div>
            <p style="margin:16px 0 0;">Message was saved to the database. Please review and follow up manually.</p>
          `,
        });

        const alertText = `SYSTEM ALERT: Internal Email Failed

Submission ID: ${submissionId}
Name: ${name}
Email: ${email}
Phone: ${phoneDisplay}
Submitted: ${submittedAt}
Email Error: ${internalErrorMsg}

Message was saved to the database. Please review and follow up manually.`;

        await clients.send({
          from: emailFrom,
          to: [emailReplyTo, "kingsley.ekinde@gmail.com"],
          subject: `⚠ SYSTEM ALERT — Contact Form Email Failed | ${email}`,
          html: alertHtml,
          text: alertText,
        });
        console.log(`${TAG} System alert email sent to ${emailReplyTo}.`);
      } catch (alertErr) {
        console.error(
          `${TAG} CRITICAL: System alert email also failed:`,
          alertErr,
        );
      }

      return new Response(
        JSON.stringify({
          error: "Message saved but email notification failed",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // --- Auto-responder to submitter (non-critical) ---
    const bookingUrl =
      "https://tidycal.com/kingsley-ekinde/30-minute-meeting-1vr60yy";

    const autoResponderHtml = buildUnifiedEmail({
      headerSubtitle: "MESSAGE RECEIVED",
      customGreeting: `Hello ${safeName},`,
      contextStatement:
        "Thank you for reaching out to KB&amp;K Legacy Shield. We received your message and a member of our team will review it and respond as soon as possible.",
      interpretation:
        "If you would like to take the next step right now, you can schedule your complimentary consultation below.",
      ctaText: "Schedule Your Complimentary Consultation",
      ctaUrl: bookingUrl,
      secondaryText: "Respectfully, KB&amp;K Legacy Shield Team",
    });

    const autoResponderText = `We received your message.

Hello ${name},

Thank you for reaching out to KB&K Legacy Shield. We received your message and a member of our team will review it and respond as soon as possible.

If you would like to take the next step right now, you can schedule your complimentary consultation:
${bookingUrl}

Respectfully,
KB&K Legacy Shield Team

---
If you did not request this message, you can ignore this email.`;

    let autoSent = false;
    let autoErrorMsg = "";

    try {
      const { error: autoError } = await clients.send({
        from: emailFrom,
        to: [email],
        replyTo: emailReplyTo,
        subject: "We received your message – KB&K Legacy Shield",
        html: autoResponderHtml,
        text: autoResponderText,
      });

      if (autoError) {
        autoErrorMsg =
          typeof autoError === "object"
            ? JSON.stringify(autoError)
            : String(autoError);
        console.error(
          `${TAG} Auto-responder failed (non-blocking):`,
          autoError,
        );
      } else {
        autoSent = true;
        console.log(`${TAG} Auto-responder sent to: ${email}`);
      }
    } catch (autoErr) {
      autoErrorMsg =
        autoErr instanceof Error ? autoErr.message : String(autoErr);
      console.error(`${TAG} Auto-responder exception (non-blocking):`, autoErr);
    }

    // Log auto-responder delivery
    await logDelivery(
      "auto_responder",
      email,
      autoSent ? "sent" : "failed",
      autoSent ? undefined : autoErrorMsg,
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`${TAG} Unexpected error:`, err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
