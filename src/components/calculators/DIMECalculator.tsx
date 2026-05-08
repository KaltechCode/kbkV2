import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Phone, PieChart, Download, Info, HelpCircle, Minus, Plus, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { EmailVerificationModal } from "./EmailVerificationModal";
import { SaveDownloadModal } from "./SaveDownloadModal";

interface DIMEResults {
  debt: number;
  income: number;
  mortgage: number;
  education: number;
  total: number;
}

const DIMECalculator = () => {
  const [inputs, setInputs] = useState({
    nonMortgageDebt: "",
    annualIncome: "",
    incomeMultiplier: "10",
    mortgageBalance: "",
    numChildren: "0",
    annualCollegeCost: "25000"
  });
  
  const [results, setResults] = useState<DIMEResults | null>(null);
  
  // Lead capture flow state
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showSaveDownload, setShowSaveDownload] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationFirstName, setVerificationFirstName] = useState("");
  const [leadId, setLeadId] = useState("");
  const [leadFirstName, setLeadFirstName] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const calculateDIME = () => {
    const D = parseFloat(inputs.nonMortgageDebt) || 0;
    const I = parseFloat(inputs.annualIncome) || 0;
    const multiplier = parseFloat(inputs.incomeMultiplier) || 10;
    const M = parseFloat(inputs.mortgageBalance) || 0;
    const numChildren = parseFloat(inputs.numChildren) || 0;
    const collegeCost = parseFloat(inputs.annualCollegeCost) || 25000;

    const I_component = I * multiplier;
    const E_total = collegeCost * 4 * numChildren;
    const total = D + I_component + M + E_total;

    setResults({
      debt: D,
      income: I_component,
      mortgage: M,
      education: E_total,
      total: total
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPercentage = (amount: number, total: number) => {
    return total > 0 ? ((amount / total) * 100).toFixed(1) : "0";
  };

  const handleSaveDownload = () => {
    if (!results) return;
    
    if (leadId && verificationEmail) {
      setShowSaveDownload(true);
    } else {
      setShowLeadCapture(true);
    }
  };

  const incrementChildren = () => {
    const current = parseInt(inputs.numChildren) || 0;
    handleInputChange("numChildren", String(current + 1));
  };

  const decrementChildren = () => {
    const current = parseInt(inputs.numChildren) || 0;
    if (current > 0) {
      handleInputChange("numChildren", String(current - 1));
    }
  };

  // Example scenarios
  const applyScenario = (scenario: typeof exampleScenarios[0]) => {
    setInputs({
      nonMortgageDebt: scenario.nonMortgageDebt,
      annualIncome: scenario.annualIncome,
      incomeMultiplier: scenario.incomeMultiplier,
      mortgageBalance: scenario.mortgageBalance,
      numChildren: scenario.numChildren,
      annualCollegeCost: scenario.annualCollegeCost
    });
    // Auto-calculate after applying scenario
    setTimeout(() => {
      const D = parseFloat(scenario.nonMortgageDebt) || 0;
      const I = parseFloat(scenario.annualIncome) || 0;
      const multiplier = parseFloat(scenario.incomeMultiplier) || 10;
      const M = parseFloat(scenario.mortgageBalance) || 0;
      const numChildren = parseFloat(scenario.numChildren) || 0;
      const collegeCost = parseFloat(scenario.annualCollegeCost) || 25000;

      const I_component = I * multiplier;
      const E_total = collegeCost * 4 * numChildren;
      const total = D + I_component + M + E_total;

      setResults({
        debt: D,
        income: I_component,
        mortgage: M,
        education: E_total,
        total: total
      });
    }, 100);
  };

  const exampleScenarios = [
    {
      name: "Young Family",
      description: "Early career, one child, modest home",
      nonMortgageDebt: "15000",
      annualIncome: "65000",
      incomeMultiplier: "10",
      mortgageBalance: "280000",
      numChildren: "1",
      annualCollegeCost: "25000"
    },
    {
      name: "Growing Family",
      description: "Mid-career, two children, larger home",
      nonMortgageDebt: "25000",
      annualIncome: "120000",
      incomeMultiplier: "10",
      mortgageBalance: "450000",
      numChildren: "2",
      annualCollegeCost: "30000"
    },
    {
      name: "Established Family",
      description: "Senior professional, three children",
      nonMortgageDebt: "10000",
      annualIncome: "200000",
      incomeMultiplier: "10",
      mortgageBalance: "600000",
      numChildren: "3",
      annualCollegeCost: "35000"
    }
  ];

  // Multiplier comparison
  const multipliers = [5, 7, 10, 12, 15];
  
  const calculateWithMultiplier = (multiplier: number) => {
    const D = parseFloat(inputs.nonMortgageDebt) || 0;
    const I = parseFloat(inputs.annualIncome) || 0;
    const M = parseFloat(inputs.mortgageBalance) || 0;
    const numChildren = parseFloat(inputs.numChildren) || 0;
    const collegeCost = parseFloat(inputs.annualCollegeCost) || 25000;

    const I_component = I * multiplier;
    const E_total = collegeCost * 4 * numChildren;
    return D + I_component + M + E_total;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="shadow-card">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl md:text-4xl font-heading text-primary mb-4">
            Find Your Protection Number (DIME)
          </CardTitle>
          <CardDescription className="text-lg text-foreground/70">
            In 60 seconds, estimate how much coverage protects your family's lifestyle, 
            debts, mortgage, and education goals.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Example Scenarios */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Try an Example</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exampleScenarios.map((scenario) => (
                <button
                  key={scenario.name}
                  onClick={() => applyScenario(scenario)}
                  className="text-left p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all group"
                >
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {scenario.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {scenario.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* What is DIME Info Panel */}
          <div className="mb-8 p-5 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-primary mb-3">What is DIME?</h3>
                <div className="space-y-2 text-sm text-foreground/80">
                  <p><strong>D</strong> — Debt (non-mortgage): Student loans, auto, personal, credit cards</p>
                  <p><strong>I</strong> — Income: Annual income × multiplier (typically 10× your salary)</p>
                  <p><strong>M</strong> — Mortgage: Your current mortgage balance</p>
                  <p><strong>E</strong> — Education: College costs for your dependents (4 years per child)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-primary mb-6">Calculate Your Number</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Debt (non-mortgage) */}
                <div>
                  <Label htmlFor="nonMortgageDebt" className="flex items-center gap-2 mb-2">
                    Debt (non-mortgage)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Include student loans, auto loans, credit cards, personal loans, etc. Do not include your mortgage.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="nonMortgageDebt"
                    type="number"
                    value={inputs.nonMortgageDebt}
                    onChange={(e) => handleInputChange("nonMortgageDebt", e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                {/* Income Multiplier */}
                <div>
                  <Label htmlFor="incomeMultiplier" className="flex items-center gap-2 mb-2">
                    Income Multiplier
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Typically 10× your income. This ensures your family can maintain their lifestyle.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="incomeMultiplier"
                    type="number"
                    value={inputs.incomeMultiplier}
                    onChange={(e) => handleInputChange("incomeMultiplier", e.target.value)}
                    min="0"
                    max="20"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Default: 10× (adjust based on your situation)
                  </p>
                </div>
                
                {/* Annual College Cost */}
                <div>
                  <Label htmlFor="annualCollegeCost" className="flex items-center gap-2 mb-2">
                    Annual College Cost (per student)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Estimated annual cost for college per child</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="annualCollegeCost"
                    type="number"
                    value={inputs.annualCollegeCost}
                    onChange={(e) => handleInputChange("annualCollegeCost", e.target.value)}
                    min="0"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    National average: $25,000/year (adjust to your state/school)
                  </p>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Annual Income */}
                <div>
                  <Label htmlFor="annualIncome" className="flex items-center gap-2 mb-2">
                    Annual Income
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Your gross annual income before taxes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={inputs.annualIncome}
                    onChange={(e) => handleInputChange("annualIncome", e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                {/* Mortgage Balance */}
                <div>
                  <Label htmlFor="mortgageBalance" className="flex items-center gap-2 mb-2">
                    Mortgage Balance
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Remaining balance on your home mortgage</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="mortgageBalance"
                    type="number"
                    value={inputs.mortgageBalance}
                    onChange={(e) => handleInputChange("mortgageBalance", e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                {/* Number of Children - Stepper */}
                <div>
                  <Label htmlFor="numChildren" className="flex items-center gap-2 mb-2">
                    Number of Children
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Number of children requiring college education</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex items-center border border-input rounded-md bg-background">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={decrementChildren}
                      className="h-10 w-10 rounded-r-none hover:bg-accent"
                      disabled={parseInt(inputs.numChildren) <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center font-medium text-base px-4">
                      {inputs.numChildren}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={incrementChildren}
                      className="h-10 w-10 rounded-l-none hover:bg-accent"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <Button 
              onClick={calculateDIME}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Calculate My Protection Number
            </Button>
          </div>

          {/* Results Section */}
          {results ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-primary">Your Protection Number</h3>
              
              <div className="bg-accent/10 p-8 rounded-lg border-2 border-accent/30 text-center">
                <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
                <h4 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">
                  {formatCurrency(results.total)}
                </h4>
                <p className="text-foreground/80">
                  Your Estimated Life Insurance Need (DIME)
                </p>
              </div>

              {/* Income Multiplier Comparison - Always Visible */}
              <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-6 border-2 border-accent/30 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <PieChart className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary">
                      Compare Income Multipliers
                    </h4>
                    <p className="text-sm text-foreground/70">
                      See how different scenarios affect your protection number
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {multipliers.map((mult) => {
                    const total = calculateWithMultiplier(mult);
                    const isCurrentMultiplier = parseFloat(inputs.incomeMultiplier) === mult;
                    return (
                      <div
                        key={mult}
                        className={`p-4 rounded-lg border text-center transition-all hover:scale-105 ${
                          isCurrentMultiplier
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          {mult}x Income
                        </div>
                        <div className={`text-base md:text-lg font-bold ${
                          isCurrentMultiplier ? "text-primary" : "text-foreground"
                        }`}>
                          {formatCurrency(total)}
                        </div>
                        {isCurrentMultiplier && (
                          <div className="flex items-center justify-center gap-1 text-xs text-primary mt-1">
                            <Shield className="w-3 h-3" />
                            Current
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-primary mb-3">Breakdown:</h4>
                
                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <span className="text-sm font-medium">D — Debt Coverage</span>
                    <p className="text-xs text-muted-foreground">Non-mortgage debt</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{formatCurrency(results.debt)}</div>
                    <div className="text-xs text-muted-foreground">{getPercentage(results.debt, results.total)}%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <span className="text-sm font-medium">I — Income Replacement</span>
                    <p className="text-xs text-muted-foreground">${formatCurrency(parseFloat(inputs.annualIncome) || 0)} × {inputs.incomeMultiplier}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{formatCurrency(results.income)}</div>
                    <div className="text-xs text-muted-foreground">{getPercentage(results.income, results.total)}%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <span className="text-sm font-medium">M — Mortgage Balance</span>
                    <p className="text-xs text-muted-foreground">Current mortgage</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{formatCurrency(results.mortgage)}</div>
                    <div className="text-xs text-muted-foreground">{getPercentage(results.mortgage, results.total)}%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <span className="text-sm font-medium">E — Education Fund</span>
                    <p className="text-xs text-muted-foreground">${formatCurrency(parseFloat(inputs.annualCollegeCost) || 0)}/year × 4 years × {inputs.numChildren} children</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{formatCurrency(results.education)}</div>
                    <div className="text-xs text-muted-foreground">{getPercentage(results.education, results.total)}%</div>
                  </div>
                </div>
              </div>


              <div className="bg-purple-accent/10 p-6 rounded-lg border border-purple-accent/20">
                <h4 className="font-heading font-semibold text-purple-accent mb-2">
                  Is Your Family Protected?
                </h4>
                <p className="text-foreground/80 mb-4">
                  If something happened tomorrow, would your family be fully protected? Is your current coverage enough?
                </p>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleSaveDownload}
                    className="w-full"
                    size="lg"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Email My Protection Report
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Receive your full protection breakdown directly in your inbox
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Fill in your information to calculate your protection number
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> These numbers are estimates ONLY and depend on the accuracy of the information entered. 
              They are not financial advice. Please consult with a qualified financial professional for personalized guidance.
            </p>
          </div>
        </CardContent>
      </Card>

      <LeadCaptureModal
        open={showLeadCapture}
        onOpenChange={setShowLeadCapture}
        onVerificationRequired={(email, firstName) => {
          setVerificationEmail(email);
          setVerificationFirstName(firstName);
          setShowEmailVerification(true);
        }}
      />

      <EmailVerificationModal
        open={showEmailVerification}
        onOpenChange={setShowEmailVerification}
        email={verificationEmail}
        firstName={verificationFirstName}
        onVerified={(id, email, firstName) => {
          setLeadId(id);
          setVerificationEmail(email);
          setLeadFirstName(firstName);
          setShowSaveDownload(true);
        }}
        onResendCode={() => {
          setShowEmailVerification(false);
          setShowLeadCapture(true);
        }}
      />

      <SaveDownloadModal
        open={showSaveDownload}
        onOpenChange={setShowSaveDownload}
        leadId={leadId}
        email={verificationEmail}
        firstName={leadFirstName}
        reportData={{
          inputs,
          results: results!
        }}
        calculatorType="dime"
      />
    </div>
  );
};

export default DIMECalculator;