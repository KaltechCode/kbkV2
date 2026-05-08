import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: hasAdminRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !hasAdminRole) {
      return new Response(
        JSON.stringify({ success: false, error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Last 20 runs
    const { data: runs, error: runsError } = await supabaseAdmin
      .from("abandonment_run_logs")
      .select("id, ran_at, processed, sent, skipped, errors, duration_ms")
      .order("ran_at", { ascending: false })
      .limit(20);

    if (runsError) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch run logs" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // 24h totals
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: dayRuns } = await supabaseAdmin
      .from("abandonment_run_logs")
      .select("processed, sent, skipped, errors")
      .gte("ran_at", since);

    const totals = (dayRuns ?? []).reduce(
      (acc, r) => ({
        runs: acc.runs + 1,
        processed: acc.processed + (r.processed ?? 0),
        sent: acc.sent + (r.sent ?? 0),
        skipped: acc.skipped + (r.skipped ?? 0),
        errors: acc.errors + (r.errors ?? 0),
      }),
      { runs: 0, processed: 0, sent: 0, skipped: 0, errors: 0 },
    );

    return new Response(
      JSON.stringify({ success: true, runs: runs ?? [], totals24h: totals }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("admin-get-abandonment-runs error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
