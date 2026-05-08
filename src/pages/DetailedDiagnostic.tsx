import { useState, useEffect, useCallback } from "react";
import { getInvisibleTurnstileToken } from "@/lib/turnstileInvisible";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DollarSign,
  Wallet,
  CreditCard,
  Shield,
  Clock,
  GraduationCap,
  Info,
  Loader2,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Scale,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──

interface WizardData {
  client_annual_gross_income: number;
  spouse_annual_gross_income: number;
  monthly_take_home_income: number;
  monthly_essential_expenses: number;
  monthly_lifestyle_expenses: number;
  emergency_fund_balance: number;
  other_liquid_savings: number;
  total_retirement_savings: number;
  total_non_retirement_investments: number;
  mortgage_balance: number;
  total_consumer_debt: number;
  student_loans: number;
  credit_card_debt: number;
  life_insurance_client: number;
  life_insurance_spouse: number;
  has_disability_coverage: boolean;
  income_replacement_years: number;
  expected_retirement_age: number;
  desired_monthly_retirement_income: number;
  annual_retirement_contributions: number;
  number_of_children: number;
  estimated_college_funding_goal: number;
  current_college_savings: number;
}

const defaultData: WizardData = {
  client_annual_gross_income: 0,
  spouse_annual_gross_income: 0,
  monthly_take_home_income: 0,
  monthly_essential_expenses: 0,
  monthly_lifestyle_expenses: 0,
  emergency_fund_balance: 0,
  other_liquid_savings: 0,
  total_retirement_savings: 0,
  total_non_retirement_investments: 0,
  mortgage_balance: 0,
  total_consumer_debt: 0,
  student_loans: 0,
  credit_card_debt: 0,
  life_insurance_client: 0,
  life_insurance_spouse: 0,
  has_disability_coverage: false,
  income_replacement_years: 10,
  expected_retirement_age: 65,
  desired_monthly_retirement_income: 0,
  annual_retirement_contributions: 0,
  number_of_children: 0,
  estimated_college_funding_goal: 0,
  current_college_savings: 0,
};

const STEPS = [
  { title: "Income Structure", icon: DollarSign },
  { title: "Liquidity Position", icon: Wallet },
  { title: "Debt & Obligations", icon: CreditCard },
  { title: "Protection Alignment", icon: Shield },
  { title: "Retirement Position", icon: Clock },
  { title: "Education & Legacy", icon: GraduationCap },
];

// ── Helpers ──

const FieldLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="flex items-center gap-1.5">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help flex-shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </div>
);

const CurrencyField = ({
  label,
  tooltip,
  value,
  onChange,
  disabled,
}: {
  label: string;
  tooltip: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) => (
  <div className="space-y-1.5">
    <FieldLabel label={label} tooltip={tooltip} />
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
      <Input
        type="text"
        inputMode="numeric"
        className="pl-7"
        placeholder="0"
        value={value ? String(value) : ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
            onChange(raw === "" ? 0 : Number(raw));
          }
        }}
        disabled={disabled}
      />
    </div>
  </div>
);

const MicroFeedback = ({ message }: { message: string | null }) => {
  if (!message) return null;

  const lower = message.toLowerCase();
  const isElevated = lower.includes("limited") || lower.includes("consuming") || lower.includes("elevated") || lower.includes("materially below") || lower.includes("gap appears significant");
  const isModerate = lower.includes("moderate") || lower.includes("partially") || lower.includes("progressing");

  let Icon: typeof CheckCircle;
  let color: string;

  if (isElevated) {
    Icon = AlertCircle;
    color = "#F6AD55";
  } else if (isModerate) {
    Icon = Scale;
    color = "#38B2ED";
  } else {
    Icon = CheckCircle;
    color = "#38B2ED";
  }

  return (
    <div className="flex items-start gap-2 mt-3 pl-1">
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color }} />
      <p className="text-sm font-medium italic leading-relaxed" style={{ color }}>
        {message}
      </p>
    </div>
  );
};

// ── Step Components ──

const Step1 = ({ data, update, disabled }: { data: WizardData; update: (k: keyof WizardData, v: number) => void; disabled: boolean }) => {
  const ratio = data.monthly_take_home_income > 0
    ? data.monthly_essential_expenses / data.monthly_take_home_income
    : null;

  let feedback: string | null = null;
  if (ratio !== null && data.monthly_take_home_income > 0) {
    if (ratio < 0.50) feedback = "Strong cash flow flexibility. This enhances resilience.";
    else if (ratio >= 0.50 && ratio < 0.65) feedback = "Essential expenses are moderately aligned with take-home income. Flexibility exists but may depend on income stability.";
    else if (ratio >= 0.65) feedback = "Essential expenses are consuming a large portion of take-home income. This may reduce flexibility during income disruptions.";
  }

  return (
    <div className="space-y-5">
      <CurrencyField label="Client Annual Gross Income" tooltip="Your income before taxes. Used to evaluate leverage and long-term capacity." value={data.client_annual_gross_income} onChange={(v) => update("client_annual_gross_income", v)} disabled={disabled} />
      <CurrencyField label="Spouse Annual Gross Income" tooltip="Combined earning power influences resilience and opportunity." value={data.spouse_annual_gross_income} onChange={(v) => update("spouse_annual_gross_income", v)} disabled={disabled} />
      <CurrencyField label="Monthly Take-Home Income" tooltip="What reaches your bank account each month. Stability depends on this." value={data.monthly_take_home_income} onChange={(v) => update("monthly_take_home_income", v)} disabled={disabled} />
      <CurrencyField label="Monthly Essential Expenses" tooltip="Non-negotiable costs such as housing, food, insurance, transportation." value={data.monthly_essential_expenses} onChange={(v) => update("monthly_essential_expenses", v)} disabled={disabled} />
      <CurrencyField label="Monthly Lifestyle Expenses" tooltip="Discretionary spending that reflects financial flexibility." value={data.monthly_lifestyle_expenses} onChange={(v) => update("monthly_lifestyle_expenses", v)} disabled={disabled} />
      <MicroFeedback message={feedback} />
    </div>
  );
};

const Step2 = ({ data, update, disabled }: { data: WizardData; update: (k: keyof WizardData, v: number) => void; disabled: boolean }) => {
  const essentialExp = data.monthly_essential_expenses;
  const liquid = data.emergency_fund_balance + data.other_liquid_savings;
  const months = essentialExp > 0 ? liquid / essentialExp : null;

  let feedback: string | null = null;
  if (months !== null) {
    if (months < 2) feedback = "Liquidity buffer appears limited relative to essential expenses.";
    else if (months >= 2 && months < 6) feedback = "Liquidity position appears moderately aligned with short-term stability needs.";
    else if (months >= 6) feedback = "Strong liquidity reserve enhances structural resilience.";
  }

  return (
    <div className="space-y-5">
      <CurrencyField label="Emergency Fund Balance" tooltip="Readily accessible savings earmarked for unexpected events." value={data.emergency_fund_balance} onChange={(v) => update("emergency_fund_balance", v)} disabled={disabled} />
      <CurrencyField label="Other Liquid Savings" tooltip="Additional cash or near-cash assets outside emergency reserves." value={data.other_liquid_savings} onChange={(v) => update("other_liquid_savings", v)} disabled={disabled} />
      <CurrencyField label="Total Retirement Savings" tooltip="Combined value across all retirement accounts (401k, IRA, etc.)." value={data.total_retirement_savings} onChange={(v) => update("total_retirement_savings", v)} disabled={disabled} />
      <CurrencyField label="Total Non-Retirement Investments" tooltip="Brokerage accounts, real estate equity, or other invested assets." value={data.total_non_retirement_investments} onChange={(v) => update("total_non_retirement_investments", v)} disabled={disabled} />
      <MicroFeedback message={feedback} />
    </div>
  );
};

const Step3 = ({ data, update, disabled }: { data: WizardData; update: (k: keyof WizardData, v: number) => void; disabled: boolean }) => {
  const totalDebt = data.mortgage_balance + data.total_consumer_debt + data.student_loans + data.credit_card_debt;
  const annualIncome = data.client_annual_gross_income + data.spouse_annual_gross_income;
  const ratio = annualIncome > 0 ? totalDebt / annualIncome : null;

  let feedback: string | null = null;
  if (ratio !== null && annualIncome > 0) {
    if (ratio < 0.30) feedback = "Debt exposure appears manageable relative to income.";
    else if (ratio >= 0.30 && ratio < 0.45) feedback = "Debt exposure appears moderate relative to income. Structural flexibility may depend on liquidity and income stability.";
    else if (ratio >= 0.45) feedback = "Debt exposure appears elevated relative to income.";
  }

  return (
    <div className="space-y-5">
      <CurrencyField label="Mortgage Balance" tooltip="Outstanding principal on your primary residence mortgage." value={data.mortgage_balance} onChange={(v) => update("mortgage_balance", v)} disabled={disabled} />
      <CurrencyField label="Total Consumer Debt" tooltip="Auto loans, personal loans, and other consumer obligations." value={data.total_consumer_debt} onChange={(v) => update("total_consumer_debt", v)} disabled={disabled} />
      <CurrencyField label="Student Loans" tooltip="Outstanding student loan balances across all borrowers." value={data.student_loans} onChange={(v) => update("student_loans", v)} disabled={disabled} />
      <CurrencyField label="Credit Card Debt" tooltip="Total revolving credit card balances carried month to month." value={data.credit_card_debt} onChange={(v) => update("credit_card_debt", v)} disabled={disabled} />
      <MicroFeedback message={feedback} />
    </div>
  );
};

const Step4 = ({ data, update, disabled }: { data: WizardData; update: (k: keyof WizardData, v: number | boolean) => void; disabled: boolean }) => {
  const totalDebt = data.mortgage_balance + data.total_consumer_debt + data.student_loans + data.credit_card_debt;
  const annualIncome = data.client_annual_gross_income + data.spouse_annual_gross_income;
  const required = totalDebt + annualIncome * data.income_replacement_years;
  const actual = data.life_insurance_client + data.life_insurance_spouse;
  const ratio = required > 0 ? actual / required : null;

  let feedback: string | null = null;
  if (ratio !== null && required > 0) {
    if (ratio < 0.50) feedback = "Current protection appears materially below calculated requirement.";
    else if (ratio >= 0.50 && ratio < 1.00) feedback = "Protection coverage appears partially aligned with calculated need.";
    else if (ratio >= 1.00) feedback = "Protection aligns with calculated need.";
  }

  return (
    <div className="space-y-5">
      <CurrencyField label="Life Insurance Coverage (Client)" tooltip="Total death benefit across all policies on the primary earner." value={data.life_insurance_client} onChange={(v) => update("life_insurance_client", v)} disabled={disabled} />
      <CurrencyField label="Life Insurance Coverage (Spouse)" tooltip="Total death benefit across all policies on the spouse." value={data.life_insurance_spouse} onChange={(v) => update("life_insurance_spouse", v)} disabled={disabled} />
      <div className="space-y-1.5">
        <FieldLabel label="Disability Coverage" tooltip="Whether you have an active income protection or disability insurance policy." />
        <div className="flex items-center gap-3">
          <Switch
            checked={data.has_disability_coverage}
            onCheckedChange={(v) => update("has_disability_coverage", v)}
            disabled={disabled}
          />
          <span className="text-sm text-muted-foreground">{data.has_disability_coverage ? "Yes" : "No"}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <FieldLabel label="Income Replacement Years" tooltip="Number of years of income you'd want replaced if the primary earner passes." />
        <Input
          type="text"
          inputMode="numeric"
          placeholder="10"
          value={data.income_replacement_years ? String(data.income_replacement_years) : ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "" || /^\d+$/.test(raw)) {
              const num = raw === "" ? 0 : Number(raw);
              if (num <= 30) update("income_replacement_years", num);
            }
          }}
          disabled={disabled}
        />
      </div>
      <MicroFeedback message={feedback} />
    </div>
  );
};

const Step5 = ({ data, update, disabled }: { data: WizardData; update: (k: keyof WizardData, v: number) => void; disabled: boolean }) => {
  const required = data.desired_monthly_retirement_income * 12 * 25;
  const ratio = required > 0 ? data.total_retirement_savings / required : null;

  let feedback: string | null = null;
  if (ratio !== null && required > 0) {
    if (ratio < 0.25) feedback = "Long-term funding gap appears significant.";
    else if (ratio >= 0.25 && ratio < 0.75) feedback = "Retirement funding is progressing but may require optimization.";
    else if (ratio >= 0.75) feedback = "Retirement funding appears aligned with stated objective.";
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <FieldLabel label="Expected Retirement Age" tooltip="The age you plan to transition to retirement income." />
        <Input
          type="text"
          inputMode="numeric"
          placeholder="65"
          value={data.expected_retirement_age ? String(data.expected_retirement_age) : ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "" || /^\d+$/.test(raw)) {
              const num = raw === "" ? 0 : Number(raw);
              if (num <= 85) update("expected_retirement_age", num);
            }
          }}
          disabled={disabled}
        />
      </div>
      <CurrencyField label="Desired Monthly Retirement Income" tooltip="The monthly income needed to sustain your lifestyle in retirement." value={data.desired_monthly_retirement_income} onChange={(v) => update("desired_monthly_retirement_income", v)} disabled={disabled} />
      <CurrencyField label="Annual Retirement Contributions" tooltip="Total yearly contributions to all retirement savings vehicles." value={data.annual_retirement_contributions} onChange={(v) => update("annual_retirement_contributions", v)} disabled={disabled} />
      <MicroFeedback message={feedback} />
    </div>
  );
};

const Step6 = ({ data, update, disabled }: { data: WizardData; update: (k: keyof WizardData, v: number) => void; disabled: boolean }) => (
  <div className="space-y-5">
    <div className="space-y-1.5">
      <FieldLabel label="Number of Children" tooltip="Children for whom you may fund education or legacy goals." />
      <Input
        type="text"
        inputMode="numeric"
        placeholder="0"
        value={data.number_of_children ? String(data.number_of_children) : ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "" || /^\d+$/.test(raw)) {
            const num = raw === "" ? 0 : Number(raw);
            if (num <= 20) update("number_of_children", num);
          }
        }}
        disabled={disabled}
      />
    </div>
    <CurrencyField label="Estimated College Funding Goal" tooltip="Total target across all children for education funding." value={data.estimated_college_funding_goal} onChange={(v) => update("estimated_college_funding_goal", v)} disabled={disabled} />
    <CurrencyField label="Current College Savings" tooltip="Total saved in 529 plans or other education-dedicated accounts." value={data.current_college_savings} onChange={(v) => update("current_college_savings", v)} disabled={disabled} />
  </div>
);

// ── Progress Indicator ──

const StepProgress = ({ currentStep }: { currentStep: number }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-3">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isDone
                  ? "bg-primary text-primary-foreground"
                  : isActive
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span className={`text-[10px] mt-1.5 text-center hidden md:block ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
    <div className="w-full bg-muted rounded-full h-1.5">
      <div
        className="bg-primary h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
      />
    </div>
  </div>
);

// ── Main Wizard Page ──

const DetailedDiagnostic = () => {
  usePageTitle("Comprehensive Financial Stress Analysis");
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [firstName, setFirstName] = useState("");

  const intakeId = sessionStorage.getItem("diagnostic_intake_id");
  const sessionToken = sessionStorage.getItem("intake_session_token");

  useEffect(() => {
    if (!intakeId || !sessionToken) {
      navigate("/stress-test/diagnostic", { replace: true });
      return;
    }

    // 1) Restore progress snapshot from a resume link if present (highest priority).
    const progressJson = sessionStorage.getItem("diagnostic_progress_snapshot");
    if (progressJson) {
      try {
        const snapshot = JSON.parse(progressJson);
        if (snapshot?.wizard_data && typeof snapshot.wizard_data === "object") {
          setData((prev) => ({ ...prev, ...snapshot.wizard_data }));
        }
        if (Number.isFinite(snapshot?.current_step)) {
          const restored = Math.max(0, Math.min(STEPS.length - 1, Number(snapshot.current_step)));
          setStep(restored);
        }
      } catch {
        // ignore corrupt snapshot
      }
      sessionStorage.removeItem("diagnostic_progress_snapshot");
    }

    // 2) Pre-fill from initial intake data (only fills fields that haven't been restored above).
    const prefillJson = sessionStorage.getItem("diagnostic_prefill");
    if (prefillJson) {
      try {
        const prefill = JSON.parse(prefillJson);
        if (prefill.first_name) {
          setFirstName(prefill.first_name);
        }
        const updates: Partial<WizardData> = {};
        if (prefill.number_of_children) {
          const childrenStr = String(prefill.number_of_children);
          const childrenNum = childrenStr === "3+" ? 3 : parseInt(childrenStr, 10);
          if (!isNaN(childrenNum)) {
            updates.number_of_children = childrenNum;
          }
        }
        if (prefill.annual_income != null && Number(prefill.annual_income) > 0) {
          updates.client_annual_gross_income = Number(prefill.annual_income);
        }
        if (prefill.monthly_expenses != null && Number(prefill.monthly_expenses) > 0) {
          updates.monthly_essential_expenses = Number(prefill.monthly_expenses);
        }
        if (prefill.mortgage_balance != null && Number(prefill.mortgage_balance) > 0) {
          updates.mortgage_balance = Number(prefill.mortgage_balance);
        }
        if (prefill.consumer_debt != null && Number(prefill.consumer_debt) > 0) {
          updates.total_consumer_debt = Number(prefill.consumer_debt);
        }
        if (prefill.life_insurance_coverage != null && Number(prefill.life_insurance_coverage) > 0) {
          updates.life_insurance_client = Number(prefill.life_insurance_coverage);
        }
        if (Object.keys(updates).length > 0) {
          // Only set fields not already populated by progress snapshot.
          setData((prev) => {
            const next = { ...prev };
            for (const [k, v] of Object.entries(updates)) {
              if (!prev[k as keyof WizardData]) {
                (next as Record<string, unknown>)[k] = v as unknown;
              }
            }
            return next;
          });
        }
      } catch {
        // Invalid JSON - ignore
      }
      sessionStorage.removeItem("diagnostic_prefill");
    }

    setLoading(false);
  }, [intakeId, sessionToken, navigate]);

  const update = useCallback((key: keyof WizardData, value: number | boolean) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Step-based autosave: fire-and-forget when the user advances.
  const saveProgress = useCallback(
    async (nextStep: number) => {
      console.log("saveProgress called", { intakeId, sessionToken });
      if (!intakeId || !sessionToken) return;
      try {
        await supabase.functions.invoke("save-diagnostic-progress", {
          body: {
            intake_id: intakeId,
            session_token: sessionToken,
            wizard_data: data,
            current_step: nextStep,
          },
        });
      } catch {
        // Silent: autosave is best-effort.
      }
    },
    [intakeId, sessionToken, data],
  );

  const handleNext = useCallback(() => {
    console.log("handleNext triggered");
    setStep((s) => {
      const next = s + 1;
      // Fire-and-forget autosave with the upcoming step index.
      void saveProgress(next);
      return next;
    });
  }, [saveProgress]);

  const handleSubmit = async () => {
    if (!intakeId || !sessionToken) return;
    setSubmitting(true);
    setError("");

    try {
      const turnstileToken = await getInvisibleTurnstileToken();
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "process-detailed-diagnostic",
        { body: { intake_id: intakeId, wizard_data: data, turnstile_token: turnstileToken, session_token: sessionToken } }
      );

      if (fnError || result?.error) {
        setError(result?.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      navigate("/diagnostic-confirmation", { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (!intakeId || !sessionToken) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <AnimatedSection variant="fade-up">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 text-center">
            <AlertCircle className="h-14 w-14 text-accent mx-auto mb-4" />
            <h1 className="text-xl font-heading font-bold text-primary mb-3">
              Diagnostic Already Submitted
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your detailed diagnostic has already been submitted. Your personalized report will be delivered within 24 hours.
            </p>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  const stepComponents = [
    <Step1 key={0} data={data} update={update} disabled={submitting} />,
    <Step2 key={1} data={data} update={update} disabled={submitting} />,
    <Step3 key={2} data={data} update={update} disabled={submitting} />,
    <Step4 key={3} data={data} update={update as any} disabled={submitting} />,
    <Step5 key={4} data={data} update={update} disabled={submitting} />,
    <Step6 key={5} data={data} update={update} disabled={submitting} />,
  ];

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-secondary py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <AnimatedSection variant="fade-up">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-10">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">
                Comprehensive Financial Stress Analysis
              </h1>
              {firstName && (
                <p className="text-sm text-muted-foreground mt-2">
                  Welcome back, {firstName}
                </p>
              )}
            </div>

            <StepProgress currentStep={step} />

            <div className="mb-2">
              <h2 className="text-lg font-heading font-semibold text-primary mb-1">
                Step {step + 1}: {STEPS[step].title}
              </h2>
              <div className="h-px bg-border mb-5" />
            </div>

            {stepComponents[step]}

            {error && (
              <p className="text-sm text-destructive mt-4">{error}</p>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0 || submitting}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit Analysis"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={submitting}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default DetailedDiagnostic;
