import { usePageTitle } from "@/hooks/usePageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import { CheckCircle, Lock } from "lucide-react";

const DiagnosticConfirmation = () => {
  usePageTitle("Diagnostic Submitted");

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <AnimatedSection variant="fade-up">
        <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg border border-border p-8 md:p-10">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-5" />
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-3">
              Your Detailed Financial Stress Analysis Is Being Prepared
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Thank you for completing your comprehensive diagnostic. Your personalized report will be delivered within 24 hours following review.
            </p>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              "Income and leverage analysis",
              "Liquidity resilience assessment",
              "Protection alignment evaluation",
              "Retirement positioning review",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            All information is encrypted and handled confidentially.
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default DiagnosticConfirmation;
