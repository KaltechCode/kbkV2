import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getClientIP, applyRateLimits, RateLimitPresets } from "../_shared/rateLimit.ts";
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
    const clientIP = getClientIP(req);
    const ipRateLimitResponse = applyRateLimits([
      {
        key: clientIP,
        config: { ...RateLimitPresets.LENIENT, keyPrefix: 'gen_fin_pdf_ip' }
      }
    ], corsHeaders);
    
    if (ipRateLimitResponse) {
      return ipRateLimitResponse;
    }

    const { leadId }: GeneratePDFRequest = await req.json();

    // Validate leadId is provided
    if (!leadId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Lead ID is required' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate leadId format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(leadId)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid leadId format' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
        JSON.stringify({ success: false, error: 'Failed to fetch lead' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!lead) {
      console.error("Lead not found:", leadId);
      return new Response(
        JSON.stringify({ success: false, error: 'Lead not found' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the lead's email was verified
    if (!lead.email_verified) {
      console.error("Email not verified for lead:", leadId);
      return new Response(
        JSON.stringify({ success: false, error: 'Email verification required' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Apply per-lead rate limiting to prevent abuse
    const leadRateLimitResponse = applyRateLimits([
      {
        key: leadId,
        config: { ...RateLimitPresets.LENIENT, keyPrefix: 'gen_fin_pdf_lead' }
      }
    ], corsHeaders);
    
    if (leadRateLimitResponse) {
      return leadRateLimitResponse;
    }

    // Fetch the most recent FIN report for this lead from the database
    const { data: report, error: reportError } = await supabase
      .from("fin_reports")
      .select("id, inputs_json, outputs_json, scenarios_json")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reportError) {
      console.error("Error fetching report:", reportError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch report data' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!report) {
      console.error("No report found for lead:", leadId);
      return new Response(
        JSON.stringify({ success: false, error: 'No report found. Please save your report first.' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Generating FIN PDF for verified lead:", leadId, "Report:", report.id);

    // Generate HTML from verified database data
    const htmlContent = generatePDFHTML(lead, {
      inputs: report.inputs_json,
      results: report.outputs_json,
      scenarios: report.scenarios_json
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportId: report.id,
        htmlContent,
        lead: {
          firstName: lead.first_name,
          lastName: lead.last_name,
          email: lead.email
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function formatCurrency(amount: number): string {
  if (!isFinite(amount) || isNaN(amount)) return "$0";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function generatePDFHTML(lead: any, reportData: any): string {
  const { inputs, results, scenarios } = reportData;
  
  // Extract values with correct field names from FINCalculator
  const finTarget = results?.finTargetAtRet || 0;
  const yearsUntil = results?.yearsUntil || 0;
  const monthlyNeeded = results?.monthlyNeeded || 0;
  
  // Input values
  const currentAge = inputs?.currentAge || 0;
  const retireAge = inputs?.retireAge || 0;
  const yearsRetired = inputs?.yearsRetired || 0;
  const desiredMonthly = parseFloat(inputs?.desiredMonthly) || 0;
  const existingSavings = parseFloat(inputs?.existing) || 0;
  const currentMonthlySave = parseFloat(inputs?.currentMonthlySave) || 0;
  
  // Advanced inputs
  const inflation = inputs?.inflation || "3.0";
  const accReturn = inputs?.accReturn || "6.0";
  const retReturn = inputs?.retReturn || "5.0";
  const mode = inputs?.mode || "simple";
  
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
            margin: 5px 0;
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
            border-bottom: 2px solid #3DAEFC;
            padding-bottom: 10px;
          }
          .metric {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #E5E7EB;
          }
          .metric:last-child {
            border-bottom: none;
          }
          .metric-label {
            font-weight: 600;
            color: #4B5563;
          }
          .metric-value {
            font-weight: bold;
            color: #1E2A4A;
          }
          .highlight {
            background: #F0F9FF;
            padding: 20px;
            border-left: 4px solid #3DAEFC;
            margin: 20px 0;
          }
          .highlight .metric-value {
            font-size: 28px;
            color: #3DAEFC;
          }
          .input-section {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
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
          .disclaimer {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin-top: 30px;
            border-radius: 4px;
            font-size: 14px;
            color: #92400E;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Financial Independence Number Report</h1>
          <p>Prepared for ${lead.first_name} ${lead.last_name}</p>
          <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="section">
          <h2>Your Financial Independence Number (FIN)</h2>
          <div class="highlight">
            <div class="metric">
              <span class="metric-label">Your FIN Target:</span>
              <span class="metric-value">${formatCurrency(finTarget)}</span>
            </div>
          </div>
          <div class="metric">
            <span class="metric-label">Years Until Financial Independence:</span>
            <span class="metric-value">${yearsUntil} years</span>
          </div>
          <div class="metric">
            <span class="metric-label">Additional Monthly Savings Required:</span>
            <span class="metric-value">${formatCurrency(monthlyNeeded)}</span>
          </div>
        </div>

        <div class="section">
          <h2>Your Inputs</h2>
          <div class="input-section">
            <div class="metric">
              <span class="metric-label">Current Age:</span>
              <span class="metric-value">${currentAge}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Desired Retirement Age:</span>
              <span class="metric-value">${retireAge}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Planned Retirement Years:</span>
              <span class="metric-value">${yearsRetired} years</span>
            </div>
            <div class="metric">
              <span class="metric-label">Desired Monthly Income (Today's $):</span>
              <span class="metric-value">${formatCurrency(desiredMonthly)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Annual Living Expenses:</span>
              <span class="metric-value">${formatCurrency(desiredMonthly * 12)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Current Savings:</span>
              <span class="metric-value">${formatCurrency(existingSavings)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Current Monthly Savings:</span>
              <span class="metric-value">${formatCurrency(currentMonthlySave)}</span>
            </div>
          </div>
        </div>

        ${mode === "advanced" ? `
        <div class="section">
          <h2>Advanced Assumptions</h2>
          <div class="input-section">
            <div class="metric">
              <span class="metric-label">Inflation Rate:</span>
              <span class="metric-value">${inflation}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Pre-Retirement Return:</span>
              <span class="metric-value">${accReturn}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Retirement Return:</span>
              <span class="metric-value">${retReturn}%</span>
            </div>
          </div>
        </div>
        ` : ''}

        ${scenarios && scenarios.length > 0 ? `
        <div class="section">
          <h2>Scenario Comparisons</h2>
          ${scenarios.map((scenario: any, index: number) => `
            <div class="metric">
              <span class="metric-label">${scenario.name || `Scenario ${index + 1}`}:</span>
              <span class="metric-value">FIN: ${formatCurrency(scenario.results?.finTargetAtRet || scenario.fin || 0)}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="cta">
          <h2>Ready to Achieve Financial Independence?</h2>
          <p>Schedule a complimentary consultation to discuss your personalized financial strategy</p>
          <p style="margin-top: 15px; font-size: 18px; font-weight: 600;">📞 Contact: info@kbklegacyshield.com</p>
        </div>

        <div class="disclaimer">
          <strong>Important Disclaimer:</strong> These numbers are estimates ONLY and depend on the accuracy of the information entered. 
          They are not financial advice. Please consult with a qualified financial professional for personalized guidance.
        </div>

        <div class="footer">
          <p><strong>KB&K Legacy Shield</strong></p>
          <p>Empowering your financial future with personalized planning</p>
        </div>
      </body>
    </html>
  `;
}

serve(handler);
