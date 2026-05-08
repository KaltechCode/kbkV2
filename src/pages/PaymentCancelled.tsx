import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import { XCircle } from "lucide-react";

const PaymentCancelled = () => {
  usePageTitle("Payment Cancelled");

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-16 px-4">
      <AnimatedSection variant="fade-up">
        <div className="max-w-xl mx-auto bg-background rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <XCircle className="w-9 h-9 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Your progress has been saved. You can complete your stress test anytime.
          </p>
          <Button asChild size="lg" className="font-semibold">
            <Link to="/financial-stability-stress-test">Return to Stress Test</Link>
          </Button>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default PaymentCancelled;