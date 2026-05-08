import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Activity, MailCheck, SkipForward, AlertTriangle } from "lucide-react";

interface RunRow {
  id: string;
  ran_at: string;
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
  duration_ms: number | null;
}

interface Totals {
  runs: number;
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
}

const AbandonmentRunsWidget = () => {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated");
        return;
      }
      const { data, error: invokeError } = await supabase.functions.invoke(
        "admin-get-abandonment-runs",
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (invokeError || !data?.success) {
        setError(data?.error || invokeError?.message || "Failed to load runs");
        return;
      }
      setRuns(data.runs ?? []);
      setTotals(data.totals24h ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load runs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Abandonment Recovery Job
          </CardTitle>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && runs.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            {totals && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <StatCard label="Runs (24h)" value={totals.runs} icon={<Activity className="h-4 w-4" />} />
                <StatCard label="Processed" value={totals.processed} />
                <StatCard label="Sent" value={totals.sent} icon={<MailCheck className="h-4 w-4 text-primary" />} />
                <StatCard label="Skipped" value={totals.skipped} icon={<SkipForward className="h-4 w-4 text-muted-foreground" />} />
                <StatCard
                  label="Errors"
                  value={totals.errors}
                  icon={<AlertTriangle className={`h-4 w-4 ${totals.errors > 0 ? "text-destructive" : "text-muted-foreground"}`} />}
                />
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recent runs
              </p>
              {runs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No runs recorded yet.</p>
              ) : (
                <div className="border rounded-md divide-y">
                  {runs.map((r) => (
                    <div key={r.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
                      <span className="text-muted-foreground min-w-[160px]">
                        {new Date(r.ran_at).toLocaleString()}
                      </span>
                      <Badge variant="outline">processed {r.processed}</Badge>
                      <Badge variant={r.sent > 0 ? "default" : "outline"}>sent {r.sent}</Badge>
                      <Badge variant="secondary">skipped {r.skipped}</Badge>
                      {r.errors > 0 ? (
                        <Badge variant="destructive">errors {r.errors}</Badge>
                      ) : (
                        <Badge variant="outline">errors 0</Badge>
                      )}
                      {typeof r.duration_ms === "number" && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {r.duration_ms} ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-lg border bg-card p-3">
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-2xl font-semibold text-primary mt-1">{value}</p>
  </div>
);

export default AbandonmentRunsWidget;
