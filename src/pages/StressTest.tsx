import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getInvisibleTurnstileToken,
  ensureTurnstileReady,
  TurnstileError,
} from "@/lib/turnstileInvisible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AnimatedSection from "@/components/AnimatedSection";
import { ArrowRight, Shield, FileText, ListChecks } from "lucide-react";
import heroImage from "@/assets/hero-family-legacy.jpg";
import { AppConfig } from "@/config/appConfig";

// ── Client-side scoring (mirrors server logic) ──

function calculatePillar1(annualIncome: number, monthlyExpenses: number): number {
  const monthlyIncome = annualIncome / 12;
  if (monthlyIncome <= 0) return 0;
  const ratio = monthlyExpenses / monthlyIncome;
  if (ratio <= 0.50) return 30;
  if (ratio <= 0.65) return 22;
  if (ratio <= 0.80) return 14;
  if (ratio <= 0.95) return 6;
  return 0;
}

function calculatePillar2(annualIncome: number, mortgageBalance: number, consumerDebt: number): number {
  if (annualIncome <= 0) return 0;
  const totalDebt = mortgageBalance + consumerDebt;
  const ratio = totalDebt / annualIncome;
  if (ratio <= 2.0) return 30;
  if (ratio <= 3.0) return 22;
  if (ratio <= 4.0) return 14;
  if (ratio <= 5.0) return 6;
  return 0;
}

function calculatePillar3(annualIncome: number, mortgageBalance: number, consumerDebt: number, lifeInsurance: number): number {
  const requiredCoverage = annualIncome * 10 + mortgageBalance + consumerDebt;
  if (requiredCoverage <= 0) return 40;
  const ratio = lifeInsurance / requiredCoverage;
  if (ratio >= 1.0) return 40;
  if (ratio >= 0.75) return 30;
  if (ratio >= 0.50) return 20;
  if (ratio >= 0.25) return 10;
  return 0;
}

function getCategory(score: number): string {
  if (score >= 80) return "Structurally Strong";
  if (score >= 60) return "Moderate Risk";
  if (score >= 40) return "Elevated Vulnerability";
  return "Financially Fragile";
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "Structurally Strong": return "text-emerald-500";
    case "Moderate Risk": return "text-amber-500";
    case "Elevated Vulnerability": return "text-orange-500";
    case "Financially Fragile": return "text-red-500";
    default: return "text-muted-foreground";
  }
}

function getCategoryBgColor(category: string): string {
  switch (category) {
    case "Structurally Strong": return "bg-emerald-500";
    case "Moderate Risk": return "bg-amber-500";
    case "Elevated Vulnerability": return "bg-orange-500";
    case "Financially Fragile": return "bg-red-500";
    default: return "bg-muted";
  }
}

function getExposureMessage(score: number): string {
  if (score < 50) return "Your current financial structure shows signs of instability that could become disruptive under pressure. Immediate attention to foundational areas is strongly recommended.";
  if (score < 75) return "Certain areas of your financial structure are creating measurable exposure that should be addressed deliberately to prevent future strain.";
  return "Your financial foundation shows strong stability, with key structures already in place to support resilience.";
}

function getInsightMessage(score: number): string {
  if (score < 50) return "At this level, most individuals are operating with visible financial strain and limited margin for error. The gaps are typically structural, not just behavioral.";
  if (score < 75) return "Most individuals in this range have hidden gaps that are not immediately visible but can surface during financial disruption.";
  return "At this level, the opportunity is not just protection, but optimization. Small adjustments can significantly strengthen long-term outcomes.";
}

const StressTest = () => {
  usePageTitle("Financial Stability Score");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileLoadFailed, setTurnstileLoadFailed] = useState(false);
  const [scoreData, setScoreData] = useState<{
    score: number;
    category: string;
    intakeId: string;
  } | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    maritalStatus: "",
    children: "",
    primaryConcern: "",
    annualIncome: "",
    monthlyExpenses: "",
    mortgageBalance: "",
    consumerDebt: "",
    lifeInsuranceCoverage: "",
    consent: false,
  });

  useEffect(() => {
    let cancelled = false;
    ensureTurnstileReady()
      .then(() => {
        if (cancelled) return;
        setTurnstileReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[StressTest] Turnstile failed to initialize:", err);
        setTurnstileLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNumericChange = (field: string, value: string) => {
    if (value === "" || (/^\d*\.?\d*$/.test(value) && Number(value) >= 0)) {
      setForm({ ...form, [field]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return;

    const numericFields = ["annualIncome", "monthlyExpenses", "mortgageBalance", "consumerDebt", "lifeInsuranceCoverage"] as const;
    for (const field of numericFields) {
      if (form[field] === "") {
        toast.error("Please fill in all financial fields.");
        return;
      }
    }

    // Block submit until Turnstile is confirmed ready.
    if (!turnstileReady) {
      if (turnstileLoadFailed) {
        toast.error(
          "Security verification could not load. Please refresh the page and try again."
        );
      } else {
        toast.message(
          "Security verification is still loading. Please wait a moment and try again."
        );
      }
      return;
    }

    setSubmitting(true);

    // ── Step 1: acquire Turnstile token (separate from save) ──
    let turnstileToken = "";
    try {
      turnstileToken = await getInvisibleTurnstileToken();
    } catch (err) {
      console.error("[StressTest] Turnstile token error:", err);
      const phase = err instanceof TurnstileError ? err.phase : "unknown";
      if (phase === "timeout") {
        toast.error(
          "Security verification timed out. Please refresh the page and try again."
        );
      } else if (phase === "expired") {
        toast.error(
          "Security verification expired. Please try submitting again."
        );
      } else {
        toast.error(
          "Security verification failed. Please refresh the page and try again."
        );
      }
      setSubmitting(false);
      return;
    }

    // ── Step 2: save intake (separate error path) ──
    try {
      const annualIncome = Number(form.annualIncome);
      const monthlyExpenses = Number(form.monthlyExpenses);
      const mortgageBalance = Number(form.mortgageBalance);
      const consumerDebt = Number(form.consumerDebt);
      const lifeInsuranceCoverage = Number(form.lifeInsuranceCoverage);

      const { data, error } = await supabase.functions.invoke("save-stress-test-intake", {
        body: {
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          marital_status: form.maritalStatus,
          number_of_children: form.children,
          primary_concern: form.primaryConcern,
          annual_income: annualIncome,
          monthly_expenses: monthlyExpenses,
          mortgage_balance: mortgageBalance,
          consumer_debt: consumerDebt,
          life_insurance_coverage: lifeInsuranceCoverage,
          turnstile_token: turnstileToken,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Store the session token for later pre-fill (token expires in 60 minutes)
      if (data?.session_token) {
        sessionStorage.setItem("intake_session_token", data.session_token);
      }

      // Calculate score client-side for immediate display
      const p1 = calculatePillar1(annualIncome, monthlyExpenses);
      const p2 = calculatePillar2(annualIncome, mortgageBalance, consumerDebt);
      const p3 = calculatePillar3(annualIncome, mortgageBalance, consumerDebt, lifeInsuranceCoverage);
      const totalScore = p1 + p2 + p3;
      const category = getCategory(totalScore);

      setScoreData({ score: totalScore, category, intakeId: data.id });
      setSubmitting(false);

      // Scroll to top to show score reveal
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("[StressTest] Intake save error:", error);
      toast.error(
        "We couldn't save your information. Please try again in a moment."
      );
      setSubmitting(false);
    }
  };

  const handleStripeCheckout = () => {
    if (!scoreData) return;
    const stripeUrl = new URL(AppConfig.STRIPE.PAYMENT_LINK);
    stripeUrl.searchParams.set("client_reference_id", scoreData.intakeId);
    window.location.href = stripeUrl.toString();
  };

  // ── Score Reveal View ──
  if (scoreData) {
    const score = scoreData.score;
    return (
      <div className="min-h-screen bg-secondary">
        {/* Score Header */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary/90">
          <div className="container mx-auto px-4 lg:px-8">
            <AnimatedSection variant="fade-up">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-8">
                  Your Preliminary Financial Stability Score
                </h1>

                {/* Score Card */}
                <div className="bg-primary/80 backdrop-blur rounded-2xl p-8 md:p-12 max-w-md mx-auto mb-8 border border-white/10">
                  <p className="text-primary-foreground/60 text-sm uppercase tracking-widest font-semibold mb-4">
                    Preliminary Score
                  </p>
                  <p className="text-6xl md:text-7xl font-bold text-primary-foreground leading-none">
                    {scoreData.score}
                    <span className="text-2xl text-primary-foreground/50 font-normal">/100</span>
                  </p>
                  <div className="mt-4">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-white text-sm font-bold ${getCategoryBgColor(scoreData.category)}`}>
                      {scoreData.category}
                    </span>
                  </div>
                </div>

                <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto border-l-4 border-sky-primary pl-4 text-left">
                  {getExposureMessage(score)}
                </p>

                <p className="text-primary-foreground/60 text-sm mt-6">
                  This is your preliminary assessment based on the information provided.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Upgrade / Conversion Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <AnimatedSection variant="fade-up">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-6">
                  Want a Deeper Financial Diagnostic?
                </h2>
                <p className="text-lg text-foreground/80 mb-4">
                  Ready to understand what is really driving your score?
                </p>
                <p className="text-lg text-foreground/80 mb-6">
                  Upgrade to a full Financial Diagnostic to uncover your key gaps, risks, and a clear path forward.
                </p>
                <p className="text-base text-foreground/60 italic mb-10">
                  {getInsightMessage(score)}
                </p>
                <Button
                  size="lg"
                  onClick={handleStripeCheckout}
                  className="bg-navy-primary text-white hover:bg-sky-primary font-heading font-semibold px-10 py-6 text-lg transition-colors"
                >
                  Unlock My Full Diagnostic ($197)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    );
  }

  // ── Intake Form View (unchanged) ──
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-gradient-hero text-white py-20 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-navy-primary/60" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              <span className="text-sky-primary">
                Find Out How Financially Exposed Your Family Really Is
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-white/90 max-w-3xl mx-auto">
              The Financial Stability Score identifies hidden gaps in protection, income
              resilience, and retirement readiness, then gives you a clear action plan.
            </p>
            <p className="text-base mb-8 text-white/70 max-w-2xl mx-auto">
              Built for first-generation wealth builders earning $120K–$300K who want clarity
              without overwhelm.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                className="bg-white text-navy-primary border-2 border-navy-primary hover:bg-navy-primary hover:text-white font-heading font-semibold px-8 py-6 text-lg transition-colors"
                onClick={() =>
                  document.getElementById("intake-form")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Get My Free Financial Stability Score
              </Button>
              <p className="text-sm text-white/70 text-center">
                Takes less than 60 seconds. No payment required to see your score.
              </p>
              <p className="text-xs text-white/50 text-center">
                Want a deeper breakdown? Full Financial Diagnostic available for $197 after your score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHY THIS EXISTS */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection variant="fade-up">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">
                Why Most Successful Families Are Still Financially Fragile
              </h2>
              <p className="text-lg text-foreground/80 mb-6">
                Many married professionals earning strong incomes are one unexpected event away
                from financial stress, not because they lack intelligence, but because their
                financial structure was never designed intentionally.
              </p>
              <ul className="space-y-3 text-foreground/80 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-sky-primary mt-1">•</span>
                  Income is strong, but protection gaps exist
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-primary mt-1">•</span>
                  Retirement numbers look good, but aren't pressure-tested
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-primary mt-1">•</span>
                  Life insurance is in place, but may not be aligned
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-primary mt-1">•</span>
                  No clear priority sequence for building wealth
                </li>
              </ul>
              <p className="text-lg font-heading font-bold text-primary">
                Clarity must come before confidence.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* SECTION 3 — WHAT YOU RECEIVE */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection variant="fade-up">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary text-center mb-12">
              What You Receive
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: "1) Financial Stability Score",
                desc: "A simplified vulnerability score based on income, protection, and long-term targets.",
              },
              {
                icon: FileText,
                title: "2) Gap & Exposure Report",
                desc: "Plain-English breakdown of where you are overexposed or underprotected.",
              },
              {
                icon: ListChecks,
                title: "3) Prioritized Action Plan",
                desc: "Clear next steps tied to protection-first strategy and generational planning.",
              },
            ].map((card) => (
              <AnimatedSection key={card.title} variant="fade-up">
                <div className="bg-card rounded-xl p-8 shadow-card h-full border border-border">
                  <card.icon className="h-10 w-10 text-sky-primary mb-4" />
                  <h3 className="text-xl font-heading font-bold text-primary mb-3">{card.title}</h3>
                  <p className="text-foreground/70">{card.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-8 text-sm italic max-w-2xl mx-auto">
            This is not a generic calculator. This is a structured diagnostic with interpretation.
          </p>
        </div>
      </section>

      {/* SECTION 4 — WHO THIS IS FOR */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection variant="fade-up">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-8">
                This Is For You If…
              </h2>
              <ul className="space-y-3 text-foreground/80 text-lg">
                {[
                  "Married (35–50) with 1–3 children",
                  "Household income $120K–$300K",
                  "Corporate professional or dual-income household",
                  "Church-connected and values-driven",
                  "First-generation wealth builder",
                  "Want structure, not just information",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-sky-primary mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection variant="fade-up">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary text-center mb-12">
              Simple 3-Step Process
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            {[
              { step: "1", label: "Complete the intake form" },
              { step: "2", label: "Get your Financial Stability Score instantly" },
              {
                step: "3",
                label:
                  "Optionally unlock your full diagnostic and action plan ($197)",
              },
            ].map((s) => (
              <AnimatedSection key={s.step} variant="fade-up">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-navy-primary text-white flex items-center justify-center text-2xl font-heading font-bold mb-4">
                    {s.step}
                  </div>
                  <p className="text-foreground/80">{s.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — INTAKE FORM */}
      <section id="intake-form" className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection variant="fade-up">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary text-center mb-4">
              Step 1: Get Your Free Financial Stability Score
            </h2>
            <div className="max-w-2xl mx-auto text-center mb-12">
              <p className="text-lg font-heading font-semibold text-primary mb-3">
                🔍 Discover Where You Truly Stand Financially – In 60 Seconds
              </p>
              <p className="text-foreground/80 mb-3">
                Complete this quick assessment to receive your personal Financial Stability Score instantly.
                No payment is required to see your score.
              </p>
              <p className="text-foreground/70 text-sm">
                After you get your results, you will have the option to:
              </p>
              <ul className="text-foreground/70 text-sm mt-2 space-y-1">
                <li>✅ Unlock your full diagnostic analysis and action plan ($197)</li>
                <li>✅ Or simply walk away with clarity. No pressure</li>
              </ul>
            </div>
          </AnimatedSection>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            {/* Personal Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marital Status *</Label>
                <Select
                  required
                  value={form.maritalStatus}
                  onValueChange={(v) => setForm({ ...form, maritalStatus: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Children *</Label>
                <Select
                  required
                  value={form.children}
                  onValueChange={(v) => setForm({ ...form, children: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3+">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Primary Concern *</Label>
              <Select
                required
                value={form.primaryConcern}
                onValueChange={(v) => setForm({ ...form, primaryConcern: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Protection">Protection</SelectItem>
                  <SelectItem value="Retirement">Retirement</SelectItem>
                  <SelectItem value="Cash Flow">Cash Flow</SelectItem>
                  <SelectItem value="Legacy">Legacy</SelectItem>
                  <SelectItem value="Not Sure">Not Sure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Household Snapshot */}
            <div className="pt-4">
              <h3 className="text-xl font-heading font-bold text-primary mb-1">Household Snapshot</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These are approximate estimates. Precision is not required.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Approximate Annual Household Income *</Label>
                  <Input
                    id="annualIncome"
                    type="text"
                    inputMode="numeric"
                    placeholder="150000"
                    required
                    value={form.annualIncome}
                    onChange={(e) => handleNumericChange("annualIncome", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Approximate Monthly Essential Expenses *</Label>
                  <Input
                    id="monthlyExpenses"
                    type="text"
                    inputMode="numeric"
                    placeholder="6000"
                    required
                    value={form.monthlyExpenses}
                    onChange={(e) => handleNumericChange("monthlyExpenses", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mortgageBalance">Current Mortgage Balance (Enter 0 if none) *</Label>
                  <Input
                    id="mortgageBalance"
                    type="text"
                    inputMode="numeric"
                    placeholder="250000"
                    required
                    value={form.mortgageBalance}
                    onChange={(e) => handleNumericChange("mortgageBalance", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumerDebt">Total Consumer Debt (credit cards, car loans, student loans combined) *</Label>
                  <Input
                    id="consumerDebt"
                    type="text"
                    inputMode="numeric"
                    placeholder="30000"
                    required
                    value={form.consumerDebt}
                    onChange={(e) => handleNumericChange("consumerDebt", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeInsuranceCoverage">Total Current Life Insurance Coverage (household combined, enter 0 if none) *</Label>
                  <Input
                    id="lifeInsuranceCoverage"
                    type="text"
                    inputMode="numeric"
                    placeholder="500000"
                    required
                    value={form.lifeInsuranceCoverage}
                    onChange={(e) => handleNumericChange("lifeInsuranceCoverage", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={form.consent}
                onCheckedChange={(v) => setForm({ ...form, consent: v === true })}
              />
              <Label htmlFor="consent" className="text-sm text-foreground/70 leading-snug cursor-pointer">
                I agree to be contacted regarding my results and next steps.
              </Label>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              ⚡ Takes less than 3 minutes. Your score will appear immediately after submission.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={!form.consent || submitting || (!turnstileReady && !turnstileLoadFailed)}
              className="w-full bg-navy-primary text-white hover:bg-sky-primary font-heading font-semibold px-8 py-6 text-lg transition-colors"
            >
              {submitting
                ? "Saving..."
                : !turnstileReady && !turnstileLoadFailed
                ? "Preparing security check..."
                : "Get My Free Score"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default StressTest;
