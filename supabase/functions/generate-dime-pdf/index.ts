import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders } from "../_shared/cors.ts";

interface GeneratePDFRequest {
  leadId: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Apply rate limiting: per-IP

    const { leadId }: GeneratePDFRequest = await req.json();

    // Validate leadId is provided
    if (!leadId) {
      return new Response(
        JSON.stringify({ success: false, error: "Lead ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Validate leadId format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(leadId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid leadId format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

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

    // Get lead information and verify email was verified
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, first_name, last_name, email, email_verified")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError) {
      console.error("Error fetching lead:", leadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch lead" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (!lead) {
      console.error("Lead not found:", leadId);
      return new Response(
        JSON.stringify({ success: false, error: "Lead not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Verify the lead's email was verified
    if (!lead.email_verified) {
      console.error("Email not verified for lead:", leadId);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email verification required",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Fetch the most recent DIME report for this lead from the database
    const { data: report, error: reportError } = await supabase
      .from("dime_reports")
      .select("id, inputs_json, outputs_json")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reportError) {
      console.error("Error fetching report:", reportError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to fetch report data",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    if (!report) {
      console.error("No report found for lead:", leadId);
      return new Response(
        JSON.stringify({
          success: false,
          error: "No report found. Please save your report first.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    console.log(
      "Generating DIME PDF for verified lead:",
      leadId,
      "Report:",
      report.id,
    );

    // Generate HTML from verified database data
    const htmlContent = generatePDFHTML(lead, {
      inputs: report.inputs_json,
      results: report.outputs_json,
    });

    return new Response(
      JSON.stringify({
        success: true,
        reportId: report.id,
        htmlContent,
        lead: {
          firstName: lead.first_name,
          lastName: lead.last_name,
          email: lead.email,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error: any) {
    console.error("Error generating DIME PDF:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

function generatePDFHTML(lead: any, reportData: any): string {
  const { inputs, results } = reportData;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 40px;
            color: #1E2A4A;
          }
          .header {
            background: linear-gradient(135deg, #1E2A4A 0%, #4B2E83 100%);
            color: white;
            padding: 40px;
            text-align: center;
            border-radius: 12px;
            margin-bottom: 40px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
          }
          .header p {
            margin: 0;
            font-size: 18px;
            opacity: 0.9;
          }
          .section {
            margin-bottom: 30px;
            padding: 25px;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
          }
          .section h2 {
            margin: 0 0 20px 0;
            color: #1E2A4A;
            font-size: 24px;
            border-bottom: 2px solid #1E2A4A;
            padding-bottom: 10px;
          }
          .result-box {
            background: #F3F4F6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .result-box h3 {
            margin: 0 0 10px 0;
            color: #4B2E83;
            font-size: 18px;
          }
          .result-value {
            font-size: 32px;
            font-weight: bold;
            color: #1E2A4A;
            margin: 10px 0;
          }
          .info-box {
            background: #E0E7FF;
            border-left: 4px solid #4B2E83;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
          }
          .info-box h3 {
            margin: 0 0 10px 0;
            color: #1E2A4A;
            font-size: 18px;
          }
          .info-box p {
            margin: 5px 0;
            font-size: 14px;
            color: #1E2A4A;
          }
          .breakdown {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .breakdown-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border: 1px solid #E5E7EB;
          }
          .breakdown-label {
            font-weight: 500;
            color: #1E2A4A;
          }
          .breakdown-sublabel {
            font-size: 12px;
            color: #6B7280;
            margin-top: 2px;
          }
          .breakdown-value {
            font-weight: bold;
            color: #4B2E83;
            font-size: 18px;
          }
          .breakdown-percent {
            color: #6B7280;
            font-size: 14px;
            margin-left: 10px;
          }
          .input-section {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .input-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #E5E7EB;
          }
          .input-row:last-child {
            border-bottom: none;
          }
          .input-label {
            color: #6B7280;
          }
          .input-value {
            font-weight: 500;
            color: #1E2A4A;
          }
          .cta {
            background: linear-gradient(135deg, #1E2A4A 0%, #4B2E83 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-top: 40px;
          }
          .cta h2 {
            margin: 0 0 10px 0;
            border: none;
            padding: 0;
            color: white;
          }
          .cta p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
          }
          .disclaimer {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin-top: 30px;
            border-radius: 4px;
            font-size: 14px;
            color: #92400E;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Your DIME Protection Report</h1>
          <p>Prepared for ${lead.first_name} ${lead.last_name}</p>
        </div>

        <div class="info-box">
          <h3>What is DIME?</h3>
          <p><strong>D</strong> — Debt (non-mortgage): Student loans, auto, personal, credit cards</p>
          <p><strong>I</strong> — Income: Annual income × multiplier (typically 10× your salary)</p>
          <p><strong>M</strong> — Mortgage: Your current mortgage balance</p>
          <p><strong>E</strong> — Education: College costs for your dependents (4 years per child)</p>
        </div>

        <div class="section">
          <h2>Your Protection Number</h2>
          <div class="result-box">
            <h3>Total Life Insurance Need (DIME)</h3>
            <div class="result-value">${formatCurrency(results?.total || 0)}</div>
            <p style="color: #6B7280; margin: 0;">Based on the DIME method calculation</p>
          </div>

          <div class="breakdown">
            <div class="breakdown-item">
              <div>
                <div class="breakdown-label">💳 D — Debt Coverage</div>
                <div class="breakdown-sublabel">Non-mortgage debt</div>
              </div>
              <span>
                <span class="breakdown-value">${formatCurrency(results?.debt || 0)}</span>
                <span class="breakdown-percent">(${getPercentage(results?.debt || 0, results?.total || 0)}%)</span>
              </span>
            </div>
            <div class="breakdown-item">
              <div>
                <div class="breakdown-label">💰 I — Income Replacement</div>
                <div class="breakdown-sublabel">${formatCurrency(parseFloat(inputs?.annualIncome) || 0)} × ${inputs?.incomeMultiplier || 10}</div>
              </div>
              <span>
                <span class="breakdown-value">${formatCurrency(results?.income || 0)}</span>
                <span class="breakdown-percent">(${getPercentage(results?.income || 0, results?.total || 0)}%)</span>
              </span>
            </div>
            <div class="breakdown-item">
              <div>
                <div class="breakdown-label">🏠 M — Mortgage Balance</div>
                <div class="breakdown-sublabel">Current mortgage</div>
              </div>
              <span>
                <span class="breakdown-value">${formatCurrency(results?.mortgage || 0)}</span>
                <span class="breakdown-percent">(${getPercentage(results?.mortgage || 0, results?.total || 0)}%)</span>
              </span>
            </div>
            <div class="breakdown-item">
              <div>
                <div class="breakdown-label">🎓 E — Education Fund</div>
                <div class="breakdown-sublabel">${formatCurrency(parseFloat(inputs?.annualCollegeCost) || 0)}/year × 4 years × ${inputs?.numChildren || 0} children</div>
              </div>
              <span>
                <span class="breakdown-value">${formatCurrency(results?.education || 0)}</span>
                <span class="breakdown-percent">(${getPercentage(results?.education || 0, results?.total || 0)}%)</span>
              </span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Your Inputs</h2>
          <div class="input-section">
            <div class="input-row">
              <span class="input-label">Non-Mortgage Debt</span>
              <span class="input-value">${formatCurrency(parseFloat(inputs?.nonMortgageDebt) || 0)}</span>
            </div>
            <div class="input-row">
              <span class="input-label">Annual Income</span>
              <span class="input-value">${formatCurrency(parseFloat(inputs?.annualIncome) || 0)}</span>
            </div>
            <div class="input-row">
              <span class="input-label">Income Multiplier</span>
              <span class="input-value">${inputs?.incomeMultiplier || 10}×</span>
            </div>
            <div class="input-row">
              <span class="input-label">Mortgage Balance</span>
              <span class="input-value">${formatCurrency(parseFloat(inputs?.mortgageBalance) || 0)}</span>
            </div>
            <div class="input-row">
              <span class="input-label">Number of Children</span>
              <span class="input-value">${inputs?.numChildren || 0}</span>
            </div>
            <div class="input-row">
              <span class="input-label">Annual College Cost per Child</span>
              <span class="input-value">${formatCurrency(parseFloat(inputs?.annualCollegeCost) || 0)}</span>
            </div>
          </div>
        </div>

        <div class="cta">
          <h2>Ready to Protect Your Family's Future?</h2>
          <p>Schedule a complimentary consultation to discuss your protection strategy</p>
          <p style="margin-top: 15px; font-size: 18px; font-weight: 600;">📞 Contact: info@kbklegacyshield.com</p>
        </div>

        <div class="disclaimer">
          <strong>Important Disclaimer:</strong> These numbers are estimates ONLY and depend on the accuracy of the information entered. 
          They are not financial advice. Please consult with a qualified financial professional for personalized guidance.
        </div>

        <div class="footer">
          <p><strong>KB&K Financial Services</strong></p>
          <p>Empowering Your Financial Future</p>
          <p style="margin-top: 10px;">Generated on ${new Date().toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          )}</p>
        </div>
      </body>
    </html>
  `;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPercentage(amount: number, total: number): string {
  return total > 0 ? ((amount / total) * 100).toFixed(1) : "0";
}

serve(handler);
