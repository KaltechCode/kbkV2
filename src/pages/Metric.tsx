import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  Droplets,
  HeartHandshake,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const Metric = () => {
  usePageTitle("Comprehensive Financial Stress Analysis");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [intakeData, setIntakeData] = useState<any>(null);

  const intakeId = sessionStorage.getItem("diagnostic_intake_id");

  async function fetchExistingData(id: string) {
    if (!id) return null;

    try {
      const { data: result, error: retrieveError } =
        await supabase.functions.invoke("retrieve-detailed-result", {
          body: { intake_id: id },
        });

      if (retrieveError || result?.error) {
        setError(result?.error || "Retrieval failed. Please try again.");
        return null;
      }

      setIntakeData(result.intake);
      return result;
    } catch {
      setError("Something went wrong. Please try again.");
      return null;
    }
  }

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        if (!intakeId) {
          navigate("/stress-test/diagnostic", { replace: true });
          return;
        }

        await fetchExistingData(intakeId);
      } catch {
        setError("Authentication failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [intakeId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!intakeData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-700">
            We could not find your report data yet.
          </p>
        </div>
      </div>
    );
  }

  const {
    risk_classification,
    income_score,
    liquidity_score,
    protection_score,
    retirement_score,
    actual_coverage,
    required_coverage,
    protection_ratio_value,
    debt_ratio_value,
    total_debt,
    essential_expense_ratio,
    liquidity_months,
    required_retirement_capital,
    retirement_funding_ratio,
    report_generated_at,
    top_risk_1,
    top_risk_2,
    top_risk_3,
    client_first_name,
    client_last_name,
    client_email,
    client_phone,
    marital_status,
    primary_concern,
  } = intakeData;

  const fmtCurrency = (value: number | null | undefined) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const fmtPct = (value: number | null | undefined) =>
    `${Math.round(Number(value || 0) * 100)}%`;

  const scoreToPct = (score: number | null | undefined) =>
    Math.max(0, Math.min(100, Math.round(Number(score || 0))));

  const gaugeColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 55) return "bg-amber-500";
    return "bg-rose-500";
  };

  const riskTone = String(risk_classification || "")
    .toLowerCase()
    .includes("high")
    ? "bg-rose-100 text-rose-800 border-rose-200"
    : String(risk_classification || "")
          .toLowerCase()
          .includes("moderate")
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";

  const generatedDate = report_generated_at
    ? new Date(report_generated_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not available";

  const scoreCards = [
    {
      label: "Income",
      value: scoreToPct(income_score),
      icon: CircleDollarSign,
    },
    {
      label: "Liquidity",
      value: scoreToPct(liquidity_score),
      icon: Droplets,
    },
    {
      label: "Protection",
      value: scoreToPct(protection_score),
      icon: ShieldCheck,
    },
    {
      label: "Retirement",
      value: scoreToPct(retirement_score),
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe_0%,_#f8fafc_35%,_#ffffff_100%)] py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-100 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Financial Risk Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                {client_first_name} {client_last_name}
              </h1>
              <p className="mt-2 text-slate-600">
                Personalized stress analysis and protection readiness snapshot.
              </p>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                Generated {generatedDate}
              </p>
              <p
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${riskTone}`}
              >
                <AlertTriangle className="h-4 w-4" />
                Risk Classification: {risk_classification || "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {scoreCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    {card.label}
                  </p>
                  <card.icon className="h-5 w-5 text-slate-500" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {card.value}
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full ${gaugeColor(card.value)}`}
                    style={{ width: `${card.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Coverage and Debt Health
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p className="flex justify-between gap-4">
                  <span>Actual Coverage</span>
                  <span className="font-medium">
                    {fmtCurrency(actual_coverage)}
                  </span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Required Coverage</span>
                  <span className="font-medium">
                    {fmtCurrency(required_coverage)}
                  </span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Protection Ratio</span>
                  <span className="font-medium">
                    {fmtPct(protection_ratio_value)}
                  </span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Total Debt</span>
                  <span className="font-medium">{fmtCurrency(total_debt)}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Debt Ratio</span>
                  <span className="font-medium">
                    {fmtPct(debt_ratio_value)}
                  </span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Essential Expense Ratio</span>
                  <span className="font-medium">
                    {fmtPct(essential_expense_ratio)}
                  </span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Liquidity Months</span>
                  <span className="font-medium">
                    {Number(liquidity_months || 0)}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Retirement Readiness
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p className="flex justify-between gap-4">
                  <span>Required Retirement Capital</span>
                  <span className="font-medium">
                    {fmtCurrency(required_retirement_capital)}
                  </span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Retirement Funding Ratio</span>
                  <span className="font-medium">
                    {fmtPct(retirement_funding_ratio)}
                  </span>
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Primary Concern
                </p>
                <p className="mt-2 text-slate-900">
                  {primary_concern || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Top Risk Drivers
              </h2>
              <ul className="mt-4 space-y-2 text-slate-700">
                {[top_risk_1, top_risk_2, top_risk_3].map((risk, idx) => (
                  <li
                    key={`risk-${idx + 1}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <span className="mr-2 font-semibold text-slate-900">
                      {idx + 1}.
                    </span>
                    {risk || "Not specified"}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Client Contact Snapshot
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p className="flex items-center gap-3">
                  <UserRound className="h-4 w-4 text-slate-500" />
                  <span>
                    {client_first_name} {client_last_name}
                  </span>
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>{client_email || "N/A"}</span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>{client_phone || "N/A"}</span>
                </p>
                <p className="flex justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                  <span>Marital Status</span>
                  <span className="font-medium">{marital_status || "N/A"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metric;
