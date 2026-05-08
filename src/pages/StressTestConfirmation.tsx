import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Mail, ClipboardList, FileText, Shield, AlertTriangle, ArrowRight, XCircle } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";

const StressTestConfirmation = () => {
  usePageTitle("Stress Test — Payment Confirmed");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        console.error("No session_id found in URL parameters.");
        setErrorMessage("Payment session not found. Please contact support.");
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("update-stress-test-payment", {
          body: { session_id: sessionId },
        });

        if (error) {
          console.error("Payment verification error:", error);
          setErrorMessage("Payment could not be verified. Please contact support.");
          setStatus("error");
          return;
        }

        if (data?.verified) {
          setStatus("success");
        } else {
          setErrorMessage(data?.error || "Payment could not be verified. Please contact support.");
          setStatus("error");
        }
      } catch (err) {
        console.error("Unexpected error verifying payment:", err);
        setErrorMessage("Payment could not be verified. Please contact support.");
        setStatus("error");
      }
    };

    verifyPayment();
  }, [searchParams]);

  const cards = [
    {
      icon: Shield,
      title: "Preliminary Financial Stability Score",
      description: "A rule-based snapshot calculated immediately after payment.",
    },
    {
      icon: AlertTriangle,
      title: "Gap & Exposure Summary",
      description: "A structured review of vulnerabilities across protection, leverage, liquidity, and retirement.",
    },
    {
      icon: FileText,
      title: "Prioritized Action Path",
      description: "Clear sequencing of what to address first.",
    },
  ];

  if (status === "error") {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center p-8">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4">
            Payment Verification Failed
          </h1>
          <p className="text-foreground/70 mb-8">
            {errorMessage}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/financial-stability-stress-test")}
          >
            Return to Stress Test
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero Confirmation */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary/90">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection variant="fade-up">
            <div className="max-w-3xl mx-auto text-center">
              {status === "loading" ? (
                <>
                  <Loader2 className="h-16 w-16 text-accent mx-auto mb-6 animate-spin" />
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-4">
                    Verifying Your Payment…
                  </h1>
                  <p className="text-lg text-primary-foreground/70">
                    Please wait while we confirm your payment with Stripe.
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-4">
                    Payment Confirmed — Your Financial Stability Stress Test Is Underway
                  </h1>
                  <p className="text-lg md:text-xl text-primary-foreground/90 mb-2">
                    Your $197 payment has been successfully processed.
                  </p>
                  <p className="text-primary-foreground/70 text-base">
                    You are now officially in the process.
                  </p>
                </>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* What Happens Next - only show after verified */}
      {status === "success" && (
        <>
          <section className="py-16 lg:py-20">
            <div className="container mx-auto px-4 lg:px-8">
              <AnimatedSection variant="fade-up">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary text-center mb-10">
                    What Happens Next
                  </h2>

                  <div className="space-y-8">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">1</div>
                      <div>
                        <h3 className="font-heading font-bold text-primary text-lg flex items-center gap-2">
                          <Mail className="h-5 w-5 text-accent" />
                          Check Your Email (within 5 minutes)
                        </h3>
                        <p className="text-foreground/70 mt-1">You will receive your Preliminary Financial Stability Score shortly.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">2</div>
                      <div>
                        <h3 className="font-heading font-bold text-primary text-lg flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-accent" />
                          Complete Your Detailed Diagnostic
                        </h3>
                        <p className="text-foreground/70 mt-1">Finish the expanded intake below to unlock your full Gap &amp; Exposure Report.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">3</div>
                      <div>
                        <h3 className="font-heading font-bold text-primary text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-accent" />
                          Receive Your Full Report (within 24 hours)
                        </h3>
                        <p className="text-foreground/70 mt-1">Your detailed analysis and prioritized action path will be delivered within 24 hours of completing the diagnostic.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-16 lg:py-20 bg-card">
            <div className="container mx-auto px-4 lg:px-8">
              <AnimatedSection variant="fade-up">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary text-center mb-10">
                  What Your Purchase Includes
                </h2>

                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {cards.map((card) => (
                    <div key={card.title} className="bg-secondary rounded-xl p-6 border border-border text-center">
                      <card.icon className="h-10 w-10 text-accent mx-auto mb-4" />
                      <h3 className="font-heading font-bold text-primary text-lg mb-2">{card.title}</h3>
                      <p className="text-foreground/70 text-sm">{card.description}</p>
                    </div>
                  ))}
                </div>

                <p className="text-center text-foreground/50 text-sm mt-8 max-w-xl mx-auto">
                  Full detailed report delivered within 24 hours after diagnostic completion.
                </p>
              </AnimatedSection>
            </div>
          </section>

          <section className="py-16 lg:py-20">
            <div className="container mx-auto px-4 lg:px-8">
              <AnimatedSection variant="fade-up">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="w-full h-px bg-border mb-10" />
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4">
                    Step 2: Complete Your Detailed Diagnostic
                  </h2>
                  <p className="text-foreground/70 mb-8">
                    This takes approximately 5–7 minutes. The more complete your answers, the more refined your final report.
                  </p>
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6"
                    onClick={() => navigate("/stress-test/diagnostic")}
                  >
                    Start Detailed Diagnostic
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </AnimatedSection>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default StressTestConfirmation;
