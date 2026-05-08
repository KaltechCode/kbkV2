import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, TrendingUp, Copy, Mail, HeartPulse } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from "recharts";

import { LeadCaptureModal } from "./LeadCaptureModal";
import { EmailVerificationModal } from "./EmailVerificationModal";
import { SaveDownloadModal } from "./SaveDownloadModal";
import { openBookingLink } from "@/lib/booking";
type Mode = "simple" | "advanced";
interface Inputs {
  currentAge: string;
  retireAge: string;
  yearsRetired: string;
  desiredMonthly: string;
  // Advanced mode
  inflation: string;
  accReturn: string;
  retReturn: string;
  existing: string;
  currentMonthlySave: string;
}
interface Results {
  finTargetAtRet: number;
  yearsUntil: number;
  monthlyNeeded: number;
}
interface ChartDataPoint {
  year: number;
  accumulated: number;
  target: number;
  yearlyContribution: number;
  investmentGrowth: number;
}
type ChartType = "area" | "bar" | "line";
const FINCalculator = () => {
  const {
    toast
  } = useToast();
  const [mode, setMode] = useState<Mode>("simple");
  const [inputs, setInputs] = useState<Inputs>({
    currentAge: "37",
    retireAge: "65",
    yearsRetired: "25",
    desiredMonthly: "6000",
    inflation: "3.0",
    accReturn: "6.0",
    retReturn: "5.0",
    existing: "0",
    currentMonthlySave: "0"
  });
  const [results, setResults] = useState<Results>({
    finTargetAtRet: 0,
    yearsUntil: 0,
    monthlyNeeded: 0
  });
  const [alerts, setAlerts] = useState<Array<{
    type: "error" | "warning";
    message: string;
  }>>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartType, setChartType] = useState<ChartType>("area");

  // Lead capture flow state
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showSaveDownload, setShowSaveDownload] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationFirstName, setVerificationFirstName] = useState("");
  const [leadId, setLeadId] = useState("");
  const [leadFirstName, setLeadFirstName] = useState("");
  const [leadLastName, setLeadLastName] = useState("");

  // Check if user has verified email in session
  useEffect(() => {
    const verifiedEmail = sessionStorage.getItem("fin_verified_email");
    const storedLeadId = sessionStorage.getItem("fin_lead_id");
    const storedFirstName = sessionStorage.getItem("fin_first_name");
    const storedLastName = sessionStorage.getItem("fin_last_name");
    if (verifiedEmail && storedLeadId && storedFirstName && storedLastName) {
      setVerificationEmail(verifiedEmail);
      setLeadId(storedLeadId);
      setLeadFirstName(storedFirstName);
      setLeadLastName(storedLastName);
    }
  }, []);
  const handleInputChange = (field: keyof Inputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const formatCurrency = (n: number): string => {
    if (!isFinite(n)) return "$0";
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });
  };
  const formatNumber = (n: number): string => {
    return isFinite(n) ? n.toLocaleString(undefined, {
      maximumFractionDigits: 0
    }) : "0";
  };
  const calculate = () => {
    const currentAge = Number(inputs.currentAge);
    const retireAge = Number(inputs.retireAge);
    const yearsRetired = Number(inputs.yearsRetired);
    const desiredMonthly = Number(inputs.desiredMonthly);
    const inflation = Number(inputs.inflation) / 100;
    const accReturn = Number(inputs.accReturn) / 100;
    const retReturn = Number(inputs.retReturn) / 100;
    const existing = Number(inputs.existing);
    const currentMonthly = Number(inputs.currentMonthlySave);
    const newAlerts: Array<{
      type: "error" | "warning";
      message: string;
    }> = [];

    // Validation
    const yearsUntil = retireAge - currentAge;
    if (yearsUntil < 0) {
      newAlerts.push({
        type: "error",
        message: "Retirement age must be greater than current age."
      });
    } else if (yearsUntil === 0) {
      newAlerts.push({
        type: "warning",
        message: "Retiring this year? Monthly savings needed assumes 12 months."
      });
    }
    if (yearsRetired <= 0) {
      newAlerts.push({
        type: "error",
        message: "Planned retirement years must be at least 1."
      });
    }
    setAlerts(newAlerts);

    // Compute FIN
    let finTargetAtRet: number;
    if (mode === "simple") {
      // Simple: FIN = monthly * 12 * retirement years (today's dollars)
      finTargetAtRet = desiredMonthly * 12 * yearsRetired;
    } else {
      // Advanced: Use real (inflation-adjusted) annuity math
      const realR = (1 + retReturn) / (1 + inflation) - 1;
      const PMT_real_annual = desiredMonthly * 12;
      let PV_real: number;
      if (Math.abs(realR) < 1e-9) {
        PV_real = PMT_real_annual * yearsRetired;
      } else {
        PV_real = PMT_real_annual * (1 - Math.pow(1 + realR, -yearsRetired)) / realR;
      }

      // Convert to nominal at retirement
      finTargetAtRet = PV_real * Math.pow(1 + inflation, Math.max(0, yearsUntil));
    }

    // Monthly needed to reach FIN by retirement date
    const months = Math.max(1, yearsUntil * 12);
    const r_m = mode === "advanced" ? accReturn / 12 : 0;
    const FV_existing = existing * Math.pow(1 + (mode === "advanced" ? accReturn : 0), Math.max(0, yearsUntil));
    let FV_currentMonthly = 0;
    if (currentMonthly > 0) {
      if (Math.abs(r_m) < 1e-9) {
        FV_currentMonthly = currentMonthly * months;
      } else {
        FV_currentMonthly = currentMonthly * ((Math.pow(1 + r_m, months) - 1) / r_m);
      }
    }
    const gap = Math.max(0, finTargetAtRet - FV_existing - FV_currentMonthly);
    let monthlyNeeded: number;
    if (gap <= 0) {
      monthlyNeeded = 0;
    } else {
      if (Math.abs(r_m) < 1e-9) {
        monthlyNeeded = gap / months;
      } else {
        monthlyNeeded = gap * r_m / (Math.pow(1 + r_m, months) - 1);
      }
    }
    setResults({
      finTargetAtRet,
      yearsUntil: Math.max(0, yearsUntil),
      monthlyNeeded
    });

    // Generate chart data
    generateChartData(yearsUntil, finTargetAtRet, monthlyNeeded, existing, currentMonthly, mode === "advanced" ? accReturn : 0);
  };
  const generateChartData = (years: number, targetFIN: number, monthlyToSave: number, existingSavings: number, currentMonthlySaving: number, annualReturn: number) => {
    const data: ChartDataPoint[] = [];
    const monthlyRate = annualReturn / 12;

    // Add starting point
    data.push({
      year: 0,
      accumulated: existingSavings,
      target: targetFIN,
      yearlyContribution: 0,
      investmentGrowth: 0
    });
    let previousAccumulated = existingSavings;

    // Calculate accumulation for each year
    for (let year = 1; year <= Math.max(years, 1); year++) {
      const months = year * 12;
      let accumulated = existingSavings;

      // Future value of existing savings
      if (annualReturn > 0) {
        accumulated = existingSavings * Math.pow(1 + annualReturn, year);
      } else {
        accumulated = existingSavings;
      }

      // Add current monthly savings contribution
      if (currentMonthlySaving > 0) {
        if (Math.abs(monthlyRate) < 1e-9) {
          accumulated += currentMonthlySaving * months;
        } else {
          accumulated += currentMonthlySaving * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        }
      }

      // Add new monthly savings contribution
      if (monthlyToSave > 0) {
        if (Math.abs(monthlyRate) < 1e-9) {
          accumulated += monthlyToSave * months;
        } else {
          accumulated += monthlyToSave * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        }
      }

      // Calculate yearly contribution and investment growth
      const yearlyContribution = (monthlyToSave + currentMonthlySaving) * 12;
      const totalGrowth = accumulated - previousAccumulated;
      const investmentGrowth = totalGrowth - yearlyContribution;
      data.push({
        year,
        accumulated: Math.round(accumulated),
        target: targetFIN,
        yearlyContribution: Math.round(yearlyContribution),
        investmentGrowth: Math.round(Math.max(0, investmentGrowth))
      });
      previousAccumulated = accumulated;
    }
    setChartData(data);
  };

  // Auto-calculate on input change
  useEffect(() => {
    calculate();
  }, [inputs, mode]);
  const copySummary = () => {
    const summary = `FIN Summary:
- Years until retirement: ${results.yearsUntil}
- Target FIN: ${formatCurrency(results.finTargetAtRet)}
- Monthly needed to hit target: ${formatCurrency(results.monthlyNeeded)}`;
    navigator.clipboard.writeText(summary).then(() => {
      toast({
        title: "Summary copied!",
        description: "Paste into notes or an email."
      });
    });
  };
  return <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* Inputs Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-heading text-primary">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentAge" className="text-sm">
                  Current age
                </Label>
                <Input id="currentAge" type="number" min="0" max="100" value={inputs.currentAge} onChange={e => handleInputChange("currentAge", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retireAge" className="text-sm">
                  Desired retirement age
                </Label>
                <Input id="retireAge" type="number" min="1" max="100" value={inputs.retireAge} onChange={e => handleInputChange("retireAge", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearsRetired" className="text-sm">
                  Planned retirement years
                  <span className="text-xs text-muted-foreground ml-1">(how long you want income)</span>
                </Label>
                <Input id="yearsRetired" type="number" min="1" max="60" value={inputs.yearsRetired} onChange={e => handleInputChange("yearsRetired", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desiredMonthly" className="text-sm">
                  Desired monthly income (today's $)
                </Label>
                <Input id="desiredMonthly" type="number" min="0" step="100" value={inputs.desiredMonthly} onChange={e => handleInputChange("desiredMonthly", e.target.value)} />
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-2 bg-muted/30 p-1.5 rounded-xl">
              <button type="button" onClick={() => setMode("simple")} className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${mode === "simple" ? "bg-background shadow-sm text-primary border border-border" : "text-muted-foreground hover:text-foreground"}`}>
                Simple
              </button>
              <button type="button" onClick={() => setMode("advanced")} className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${mode === "advanced" ? "bg-background shadow-sm text-primary border border-border" : "text-muted-foreground hover:text-foreground"}`}>
                Advanced
              </button>
            </div>

            {/* Advanced Fields */}
            {mode === "advanced" && <div className="space-y-4 pt-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="inflation" className="text-xs">
                      Expected inflation (annual %)
                    </Label>
                    <Input id="inflation" type="number" min="0" step="0.1" value={inputs.inflation} onChange={e => handleInputChange("inflation", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accReturn" className="text-xs">
                      Investment return before retirement (annual %)
                    </Label>
                    <Input id="accReturn" type="number" min="0" step="0.1" value={inputs.accReturn} onChange={e => handleInputChange("accReturn", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retReturn" className="text-xs">
                      Investment return during retirement (annual %)
                    </Label>
                    <Input id="retReturn" type="number" min="0" step="0.1" value={inputs.retReturn} onChange={e => handleInputChange("retReturn", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="existing" className="text-sm">
                      Current retirement savings (total)
                    </Label>
                    <Input id="existing" type="number" min="0" step="1000" value={inputs.existing} onChange={e => handleInputChange("existing", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentMonthlySave" className="text-sm">
                      Current monthly saving toward retirement
                    </Label>
                    <Input id="currentMonthlySave" type="number" min="0" step="50" value={inputs.currentMonthlySave} onChange={e => handleInputChange("currentMonthlySave", e.target.value)} />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Advanced mode uses <strong>real (inflation-adjusted)</strong> math for the retirement income stream and
                  converts to a nominal target at retirement.
                </p>
              </div>}

            {/* Assumption Box */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
                <TrendingUp className="h-3 w-3" />
                Assumption
              </div>
              <p className="text-xs text-muted-foreground">
                Simple mode: <em>FIN = monthly income × 12 × retirement years</em>. Advanced mode: adjusts for inflation
                and uses annuity math with real returns.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-heading text-primary">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alerts */}
            {alerts.length > 0 && <div className="space-y-2">
                {alerts.map((alert, idx) => <div key={idx} className={`flex items-start gap-2 p-3 rounded-lg text-sm ${alert.type === "error" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border border-yellow-500/20"}`}>
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{alert.message}</span>
                  </div>)}
              </div>}

            {/* KPI Cards */}
            <div className="space-y-3">
              <div className="border-2 border-dashed border-border rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-muted-foreground">Financial Independence Number (target nest egg)</h3>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(results.finTargetAtRet)}</div>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-muted-foreground">Years until retirement</h3>
                  <div className="text-2xl font-bold text-primary">{formatNumber(results.yearsUntil)}</div>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-muted-foreground">Monthly needed to hit FIN</h3>
                  <div className="text-xl font-bold text-primary">{formatCurrency(results.monthlyNeeded)}</div>
                </div>
              </div>
            </div>

            {/* Email Results CTA */}
            {results.finTargetAtRet > 0 && <div className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 space-y-4">
                <div className="text-center space-y-2">
                  <Button size="lg" className="w-full h-auto py-4" onClick={() => {
                if (leadId && verificationEmail) {
                  setShowSaveDownload(true);
                } else {
                  setShowLeadCapture(true);
                }
              }}>
                    <Mail className="mr-2 h-5 w-5" />
                    Email My Results
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Get your personalized results + breakdown sent to your inbox
                  </p>
                </div>
              </div>}

            {/* Chart */}
            {chartData.length > 0 && results.yearsUntil > 0 && <div className="border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-primary">Savings Accumulation Path</h3>
                  <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
                    <button type="button" onClick={() => setChartType("area")} className={`px-3 py-1 rounded text-xs font-medium transition-all ${chartType === "area" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      Area
                    </button>
                    <button type="button" onClick={() => setChartType("bar")} className={`px-3 py-1 rounded text-xs font-medium transition-all ${chartType === "bar" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      Bar
                    </button>
                    <button type="button" onClick={() => setChartType("line")} className={`px-3 py-1 rounded text-xs font-medium transition-all ${chartType === "line" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      Line
                    </button>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={250}>
                  {chartType === "area" ? <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAccumulated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" label={{
                  value: 'Years',
                  position: 'insideBottom',
                  offset: -5
                }} tick={{
                  fill: 'hsl(var(--muted-foreground))'
                }} stroke="hsl(var(--border))" />
                      <YAxis tickFormatter={value => `$${(value / 1000).toFixed(0)}k`} tick={{
                  fill: 'hsl(var(--muted-foreground))'
                }} stroke="hsl(var(--border))" />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} labelStyle={{
                  color: 'hsl(var(--foreground))'
                }} />
                      <Legend wrapperStyle={{
                  paddingTop: '10px'
                }} iconType="line" />
                      <Area type="monotone" dataKey="accumulated" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorAccumulated)" name="Your Projected Savings" />
                      <Line type="monotone" dataKey="target" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="FIN Target" />
                    </AreaChart> : chartType === "bar" ? <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" label={{
                  value: 'Years',
                  position: 'insideBottom',
                  offset: -5
                }} tick={{
                  fill: 'hsl(var(--muted-foreground))'
                }} stroke="hsl(var(--border))" />
                      <YAxis tickFormatter={value => `$${(value / 1000).toFixed(0)}k`} tick={{
                  fill: 'hsl(var(--muted-foreground))'
                }} stroke="hsl(var(--border))" />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} labelStyle={{
                  color: 'hsl(var(--foreground))'
                }} />
                      <Legend wrapperStyle={{
                  paddingTop: '10px'
                }} />
                      <Bar dataKey="yearlyContribution" stackId="a" fill="hsl(var(--primary))" name="Yearly Contributions" />
                      <Bar dataKey="investmentGrowth" stackId="a" fill="hsl(var(--accent))" name="Investment Growth" />
                    </BarChart> : <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" label={{
                  value: 'Years',
                  position: 'insideBottom',
                  offset: -5
                }} tick={{
                  fill: 'hsl(var(--muted-foreground))'
                }} stroke="hsl(var(--border))" />
                      <YAxis tickFormatter={value => `$${(value / 1000).toFixed(0)}k`} tick={{
                  fill: 'hsl(var(--muted-foreground))'
                }} stroke="hsl(var(--border))" />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} labelStyle={{
                  color: 'hsl(var(--foreground))'
                }} />
                      <Legend wrapperStyle={{
                  paddingTop: '10px'
                }} />
                      <Line type="monotone" dataKey="accumulated" stroke="hsl(var(--primary))" strokeWidth={2} name="Your Projected Savings" />
                      <Line type="monotone" dataKey="target" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" name="FIN Target" />
                    </LineChart>}
                </ResponsiveContainer>
              </div>}


            {/* Callout CTA */}
            <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border border-primary/15 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <HeartPulse className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <p className="text-base md:text-[1.05rem] leading-relaxed font-sans">
                  <strong className="text-primary">Heart check:</strong> If future-you needed this income, how close are you – today – to funding it?
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" className="w-full" size="lg" onClick={copySummary}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy my summary
                </Button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Disclaimer:</strong> These numbers are estimates ONLY and depend on the accuracy of the information entered. 
                They are not financial advice. Please consult with a qualified financial professional for personalized guidance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Capture Modals */}
      <LeadCaptureModal open={showLeadCapture} onOpenChange={setShowLeadCapture} onVerificationRequired={(email, firstName) => {
      setVerificationEmail(email);
      setVerificationFirstName(firstName);
      setShowEmailVerification(true);
    }} />

      <EmailVerificationModal open={showEmailVerification} onOpenChange={setShowEmailVerification} email={verificationEmail} firstName={verificationFirstName} onVerified={(id, email, firstName, lastName) => {
      setLeadId(id);
      setVerificationEmail(email);
      setLeadFirstName(firstName);
      setLeadLastName(lastName);
      setShowSaveDownload(true);
    }} onResendCode={() => {
      setShowEmailVerification(false);
      setShowLeadCapture(true);
    }} />

      <SaveDownloadModal open={showSaveDownload} onOpenChange={setShowSaveDownload} leadId={leadId} email={verificationEmail} firstName={leadFirstName} reportData={{
      inputs: inputs,
      results: results,
      scenarios: []
    }} />
    </div>;
};
export default FINCalculator;