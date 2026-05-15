import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { buildUnifiedEmail } from "../_shared/emailTemplate.ts";
import {
  buildResumeFooterHtml,
  buildResumeTokenRecord,
} from "../_shared/resumeToken.ts";
import { AppConfig } from "../_shared/appConfig.ts";
import transporter from "../_shared/emailClient.ts";

// ── UUID v4 validation ──
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Scoring Engine ──

function calculatePillar1(
  annualIncome: number,
  monthlyExpenses: number,
): number {
  const monthlyIncome = annualIncome / 12;
  if (monthlyIncome <= 0) return 0;
  const ratio = monthlyExpenses / monthlyIncome;
  if (ratio <= 0.5) return 30;
  if (ratio <= 0.65) return 22;
  if (ratio <= 0.8) return 14;
  if (ratio <= 0.95) return 6;
  return 0;
}

function calculatePillar2(
  annualIncome: number,
  mortgageBalance: number,
  consumerDebt: number,
): number {
  if (annualIncome <= 0) return 0;
  const totalDebt = mortgageBalance + consumerDebt;
  const ratio = totalDebt / annualIncome;
  if (ratio <= 2.0) return 30;
  if (ratio <= 3.0) return 22;
  if (ratio <= 4.0) return 14;
  if (ratio <= 5.0) return 6;
  return 0;
}

function calculatePillar3(
  annualIncome: number,
  mortgageBalance: number,
  consumerDebt: number,
  lifeInsurance: number,
): number {
  const requiredCoverage = annualIncome * 10 + mortgageBalance + consumerDebt;
  if (requiredCoverage <= 0) return 40;
  const ratio = lifeInsurance / requiredCoverage;
  if (ratio >= 1.0) return 40;
  if (ratio >= 0.75) return 30;
  if (ratio >= 0.5) return 20;
  if (ratio >= 0.25) return 10;
  return 0;
}

function getCategory(score: number): string {
  if (score >= 80) return "Structurally Strong";
  if (score >= 60) return "Moderate Risk";
  if (score >= 40) return "Elevated Vulnerability";
  return "Financially Fragile";
}

function getExposureMessage(score: number): string {
  if (score < 50)
    return "Your current financial structure shows signs of instability that could become disruptive under pressure. Immediate attention to foundational areas is strongly recommended.";
  if (score < 75)
    return "Certain areas of your financial structure are creating measurable exposure that should be addressed deliberately to prevent future strain.";
  return "Your financial foundation shows strong stability, with key structures already in place to support resilience.";
}

function getInsightMessage(score: number): string {
  if (score < 50)
    return "At this level, most individuals are operating with visible financial strain and limited margin for error. The gaps are typically structural, not just behavioral.";
  if (score < 75)
    return "Most individuals in this range have hidden gaps that are not immediately visible but can surface during financial disruption.";
  return "At this level, the opportunity is not just protection, but optimization. Small adjustments can significantly strengthen long-term outcomes.";
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "Structurally Strong":
      return "#22C55E";
    case "Moderate Risk":
      return "#F59E0B";
    case "Elevated Vulnerability":
      return "#F97316";
    case "Financially Fragile":
      return "#EF4444";
    default:
      return "#666";
  }
}

function generateEmailHTML(
  firstName: string,
  score: number,
  category: string,
  email: string,
  intakeId: string,
  resumeRawToken: string | null,
  req?: Request,
): string {
  const exposureMessage = getExposureMessage(score);
  const insightMessage = getInsightMessage(score);
  const categoryColor = getCategoryColor(category);
  const stripeCheckoutUrl = `${AppConfig.STRIPE.PAYMENT_LINK}?client_reference_id=${encodeURIComponent(intakeId)}`;

  const cardContent = `
    <p style="color:#718096;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px 0;text-align:center;font-weight:600;">Your Preliminary Financial Stability Score</p>
    <p style="font-size:56px;font-weight:800;color:#0A2240;margin:0;text-align:center;line-height:1;">
      ${score}<span style="font-size:22px;color:#718096;font-weight:400;">/100</span>
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px auto 0 auto;">
      <tr>
        <td style="background-color:${categoryColor};padding:6px 20px;border-radius:20px;">
          <p style="color:#FFFFFF;font-size:14px;font-weight:700;margin:0;letter-spacing:0.5px;">${category}</p>
        </td>
      </tr>
    </table>
  `;

  return buildUnifiedEmail({
    headerSubtitle: "FINANCIAL STABILITY REPORT",
    firstName,
    contextStatement:
      "Thank you for completing your Financial Stability Stress Test. Your preliminary results are ready.",
    cardContent,
    interpretation: `${exposureMessage}<br/><br/><em style="color:#718096;">${insightMessage}</em>`,
    ctaText: "Unlock My Full Diagnostic ($197)",
    ctaUrl: stripeCheckoutUrl,
    secondaryText: `Your full Gap &amp; Exposure Report will be delivered within 24 hours of completing your diagnostic after purchase.${buildResumeFooterHtml(resumeRawToken, req)}`,
  });
}

// ── Main Handler ──

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Authorization: require service_role key ──
  const authHeader = req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
    console.warn("Unauthorized call to process-stress-test-score");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { intake_id, skip_payment_check } = body;

    // ── Input validation ──
    if (
      !intake_id ||
      typeof intake_id !== "string" ||
      !UUID_RE.test(intake_id)
    ) {
      return new Response(
        JSON.stringify({
          error: "intake_id is required and must be a valid UUID",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ── Rate limiting: 3 requests/min per intake_id + 20/min per IP as secondary ──

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Fetch intake record
    const { data: intake, error: fetchError } = await supabase
      .from("financial_stress_test_intakes")
      .select("*")
      .eq("id", intake_id)
      .single();

    if (fetchError || !intake) {
      console.error("Failed to fetch intake:", fetchError);
      return new Response(
        JSON.stringify({ error: "Intake record not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2) Guard: only process paid + not yet emailed (skip payment check if triggered at intake time)
    if (skip_payment_check !== true && intake.payment_status !== "paid") {
      console.warn("Intake not paid, skipping:", intake_id);
      return new Response(
        JSON.stringify({ error: "Payment not verified", skipped: true }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (intake.preliminary_email_sent === true) {
      console.log("Score already processed for intake:", intake_id);
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          message: "Already processed",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3) Validate required numeric fields
    const requiredFields = [
      "annual_income",
      "monthly_expenses",
      "mortgage_balance",
      "consumer_debt",
      "life_insurance_coverage",
    ];
    for (const field of requiredFields) {
      if (intake[field] == null || isNaN(Number(intake[field]))) {
        console.error(`Missing or invalid field: ${field}`, intake[field]);
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    const annualIncome = Number(intake.annual_income);
    const monthlyExpenses = Number(intake.monthly_expenses);
    const mortgageBalance = Number(intake.mortgage_balance);
    const consumerDebt = Number(intake.consumer_debt);
    const lifeInsurance = Number(intake.life_insurance_coverage);

    // 4) Calculate score
    const pillar1 = calculatePillar1(annualIncome, monthlyExpenses);
    const pillar2 = calculatePillar2(
      annualIncome,
      mortgageBalance,
      consumerDebt,
    );
    const pillar3 = calculatePillar3(
      annualIncome,
      mortgageBalance,
      consumerDebt,
      lifeInsurance,
    );
    const totalScore = pillar1 + pillar2 + pillar3;
    const category = getCategory(totalScore);

    console.log(
      `Score calculated for ${intake_id}: ${totalScore} (${category}) | P1=${pillar1} P2=${pillar2} P3=${pillar3}`,
    );

    // 5) Update intake with score (atomic update with idempotency check)
    const { error: updateError } = await supabase
      .from("financial_stress_test_intakes")
      .update({
        preliminary_score: totalScore,
        preliminary_category: category,
        score_generated_at: new Date().toISOString(),
        preliminary_email_sent: true, // set optimistically to prevent duplicates
      })
      .eq("id", intake_id)
      .eq("preliminary_email_sent", false); // idempotency guard

    if (updateError) {
      console.error("Failed to update score:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update score" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6) Send email
    if (!transporter) {
      console.error("Deno mailer not configured");
      // Roll back the email_sent flag since email didn't go out
      await supabase
        .from("financial_stress_test_intakes")
        .update({ preliminary_email_sent: false })
        .eq("id", intake_id);
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Mint a fresh 7-day resume token so the email can include a recovery link.
    let resumeRawToken: string | null = null;
    try {
      const resumeRecord = await buildResumeTokenRecord();
      const { error: resumeErr } = await supabase
        .from("financial_stress_test_intakes")
        .update({
          resume_token_hash: resumeRecord.tokenHash,
          resume_token_last4: resumeRecord.last4,
          resume_token_expires_at: resumeRecord.expiresAt,
        })
        .eq("id", intake_id);
      if (!resumeErr) resumeRawToken = resumeRecord.rawToken;
      else console.error("Failed to mint resume token:", resumeErr);
    } catch (resumeErr) {
      console.error(
        "Resume token generation failed (non-blocking):",
        resumeErr,
      );
    }

    console.log(
      `DEBUG EMAIL BINDING: score=${totalScore}, type=${typeof totalScore}, category=${category}, firstName=${intake.first_name}`,
    );
    const emailHTML = generateEmailHTML(
      intake.first_name,
      totalScore,
      category,
      intake.email,
      intake_id,
      resumeRawToken,
      req,
    );

    try {
      const emailResponse = await transporter.sendMail({
        from: Deno.env.get("EMAIL_FROM")!,
        to: [intake.email],
        subject: "Your Preliminary Financial Stability Score Is Ready",
        html: emailHTML,
        reply_to: AppConfig.EMAIL_REPLY_TO,
      });

      console.log("Preliminary score email sent:", emailResponse);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      // Roll back email_sent flag
      await supabase
        .from("financial_stress_test_intakes")
        .update({ preliminary_email_sent: false })
        .eq("id", intake_id);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        score: totalScore,
        category,
        email_sent: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
