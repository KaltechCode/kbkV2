import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getClientIP, applyRateLimits, RateLimitPresets } from "../_shared/rateLimit.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface SaveReportRequest {
  leadId: string;
  calculatorType: "fin" | "dime";
  reportData: {
    inputs: Record<string, any>;
    results: Record<string, any>;
    scenarios?: Record<string, any>[];
  };
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
    const rateLimitResponse = applyRateLimits([
      {
        key: clientIP,
        config: { ...RateLimitPresets.STANDARD, keyPrefix: 'save_report_ip' }
      }
    ], corsHeaders);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { leadId, calculatorType, reportData }: SaveReportRequest = await req.json();

    // Validate required fields
    if (!leadId || !calculatorType || !reportData) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate leadId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(leadId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid lead ID format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate calculator type
    if (!["fin", "dime"].includes(calculatorType)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid calculator type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate reportData structure
    if (!reportData.inputs || typeof reportData.inputs !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid inputs data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!reportData.results || typeof reportData.results !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid results data" }),
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

    // Verify lead exists and email is verified
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, email, email_verified, user_id")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError) {
      console.error("Error fetching lead:", leadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify lead" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!lead) {
      console.error("Lead not found:", leadId);
      return new Response(
        JSON.stringify({ success: false, error: "Lead not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!lead.email_verified) {
      console.error("Lead email not verified:", leadId);
      return new Response(
        JSON.stringify({ success: false, error: "Email verification required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Apply per-lead rate limiting
    const leadRateLimitResponse = applyRateLimits([
      {
        key: leadId,
        config: { ...RateLimitPresets.LENIENT, keyPrefix: 'save_report_lead' }
      }
    ], corsHeaders);
    
    if (leadRateLimitResponse) {
      return leadRateLimitResponse;
    }

    console.log(`Saving ${calculatorType} report for lead:`, leadId);

    let report;
    let reportError;

    if (calculatorType === "fin") {
      const result = await supabase
        .from("fin_reports")
        .insert({
          lead_id: leadId,
          email: lead.email,
          user_id: lead.user_id,
          inputs_json: reportData.inputs,
          outputs_json: reportData.results,
          scenarios_json: reportData.scenarios || []
        })
        .select()
        .single();
      
      report = result.data;
      reportError = result.error;
    } else {
      const result = await supabase
        .from("dime_reports")
        .insert({
          lead_id: leadId,
          email: lead.email,
          user_id: lead.user_id,
          inputs_json: reportData.inputs,
          outputs_json: reportData.results
        })
        .select()
        .single();
      
      report = result.data;
      reportError = result.error;
    }

    if (reportError) {
      console.error("Error saving report:", reportError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save report" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Report saved successfully:", report.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportId: report.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error saving report:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
