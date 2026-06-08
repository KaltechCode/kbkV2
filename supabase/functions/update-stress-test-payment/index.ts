import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  buildUnifiedEmail,
  buildAdminNotificationEmail,
} from "../_shared/emailTemplate.ts";
import { AppConfig } from "../_shared/appConfig.ts";

import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_SECRET"));

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Retrieve checkout session from Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session_id}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      },
    );

    if (!stripeResponse.ok) {
      const errText = await stripeResponse.text();
      console.error("Stripe API error:", stripeResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to verify payment with Stripe." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const session = await stripeResponse.json();

    // 2) Verify payment is complete
    if (session.payment_status !== "paid" || session.status !== "complete") {
      console.warn("Payment not verified:", {
        payment_status: session.payment_status,
        status: session.status,
      });
      return new Response(
        JSON.stringify({
          error: "Payment could not be verified. Please contact support.",
          verified: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3) Extract intake_id from client_reference_id
    const intakeId = session.client_reference_id;
    if (!intakeId) {
      console.error("No client_reference_id found in Stripe session");
      return new Response(
        JSON.stringify({
          error:
            "Could not match payment to intake record. Please contact support.",
          verified: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const internalHtml = buildAdminNotificationEmail({
      title: "New Payment Notification Recieved",
      subtitle: "ADMIN NOTIFICATION",
      bodyHtml: `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;color:#333333;line-height:1.6;">
              <tr>
                <td style="padding:8px 0;font-weight:bold;width:120px;vertical-align:top;">Name:</td>
                <td style="padding:8px 0;">${session.customer_details.name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Email:</td>
                <td style="padding:8px 0;">${session.customer_details.email}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Amount:</td>
                <td style="padding:8px 0;">$ ${session.amount_total / 100}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:bold;vertical-align:top;">ID:</td>
                <td style="padding:8px 0;">${session.id}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Status:</td>
                <td style="padding:8px 0;">${session.status}</td>
              </tr>
            </table>
          `,
    });
    const customerHtml = buildAdminNotificationEmail({
      title: "New Payment Notification Sent",
      subtitle: "Customer NOTIFICATION",
      bodyHtml: `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;color:#333333;line-height:1.6;">
              <tr>
                <td style="padding:8px 0;font-weight:bold;width:120px;vertical-align:top;">Name:</td>
                <td style="padding:8px 0;">${session.customer_details.name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Email:</td>
                <td style="padding:8px 0;">${session.customer_details.email}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Amount:</td>
                <td style="padding:8px 0;">$ ${session.amount_total / 100}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:bold;vertical-align:top;">ID:</td>
                <td style="padding:8px 0;">${session.id}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Purpose</td>
                <td style="padding:8px 0;">Diagnostic Payment</td>
              </tr>
            </table>
          `,
    });

    const internalText = `Diagostic Payment Notification`;

    const emailFrom = Deno.env.get("SENDER_EMAIL")!;
    const emailReplyTo = AppConfig.EMAIL_REPLY_TO;

    // 4) Update intake record
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await resend.emails.send({
      from: emailFrom,
      to: emailReplyTo,
      replyTo: emailReplyTo,
      subject: `Payment Notification — ${session.customer_details.name}`,
      html: internalHtml,
      text: internalText,
    });
    await resend.emails.send({
      from: emailFrom,
      to: [session.customer_details.email],
      replyTo: emailReplyTo,
      subject: `Payment Notification — ${session.customer_details.name}`,
      html: customerHtml,
      text: internalText,
    });
    console.log(session);

    const { error } = await supabase
      .from("financial_stress_test_intakes")
      .update({ payment_status: "paid", paid_at: new Date().toISOString() })
      .eq("id", intakeId);

    if (error) {
      console.error("Update error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update payment status." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Payment verified and intake updated:", intakeId);

    // Trigger scoring + email automation
    try {
      const scoreUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-stress-test-score`;
      const scoreResponse = await fetch(scoreUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ intake_id: intakeId }),
      });

      if (!scoreResponse.ok) {
        const errText = await scoreResponse.text();
        console.error(
          "Score processing failed:",
          scoreResponse.status,
          errText,
        );
      }
      const scoreResult = await scoreResponse.json();
      console.log("Score processing result:", scoreResult);

      console.log("Score processing result:", scoreResult);
    } catch (scoreErr) {
      // Log but don't fail the payment verification response
      console.error("Score processing failed (non-blocking):", scoreErr);
    }

    return new Response(
      JSON.stringify({ success: true, verified: true, intake_id: intakeId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
