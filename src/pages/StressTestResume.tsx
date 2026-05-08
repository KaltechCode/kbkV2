import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";

type Status = "validating" | "success" | "expired" | "invalid" | "needs_payment";

const StressTestResume = () => {
  usePageTitle("Resume Your Stress Test");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("validating");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("invalid");
      setErrorMsg("This link is no longer valid. Please restart your assessment.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "validate-resume-token",
          { body: { token } },
        );

        if (cancelled) return;

        if (error || !data) {
          setStatus("invalid");
          setErrorMsg("This link is no longer valid. Please restart your assessment.");
          return;
        }

        if (data.expired) {
          setStatus("expired");
          setErrorMsg(data.error || "This link has expired.");
          return;
        }

        if (!data.valid || !data.intake_id || !data.session_token) {
          setStatus("invalid");
          setErrorMsg(data.error || "This link is no longer valid. Please restart your assessment.");
          return;
        }

        // Persist resumed session for the existing diagnostic flow to pick up.
        sessionStorage.setItem("diagnostic_intake_id", data.intake_id);
        sessionStorage.setItem("intake_session_token", data.session_token);
        if (data.prefill) {
          sessionStorage.setItem("diagnostic_prefill", JSON.stringify(data.prefill));
        }
        if (data.intake_progress) {
          sessionStorage.setItem(
            "diagnostic_progress_snapshot",
            JSON.stringify(data.intake_progress),
          );
        } else {
          sessionStorage.removeItem("diagnostic_progress_snapshot");
        }

        // If the user hasn't paid yet, send them back to the stress-test page to complete payment.
        if (data.payment_status !== "paid") {
          setStatus("needs_payment");
          return;
        }

        setStatus("success");
        navigate("/detailed-diagnostic", { replace: true });
      } catch {
        if (cancelled) return;
        setStatus("invalid");
        setErrorMsg("This link is no longer valid. Please restart your assessment.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate]);

  if (status === "validating" || status === "success") {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Validating your secure link…</p>
        </div>
      </div>
    );
  }

  if (status === "needs_payment") {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <AnimatedSection variant="fade-up">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 md:p-10 text-center">
            <ShieldCheck className="h-14 w-14 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-primary mb-3">
              Your Information Is Saved
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Your stress test intake is on file. Complete your purchase to unlock the
              detailed diagnostic.
            </p>
            <Button asChild className="w-full">
              <Link to="/financial-stability-stress-test">Continue Your Assessment</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  // invalid or expired
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <AnimatedSection variant="fade-up">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 md:p-10 text-center">
          <AlertTriangle className="h-14 w-14 text-accent mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-primary mb-3">
            {status === "expired" ? "Link Expired" : "Link No Longer Valid"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {errorMsg || "This link is no longer valid. Please restart your assessment."}
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/financial-stability-stress-test">Restart Stress Test</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/stress-test/diagnostic">Verify Access With Email</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Need help? Contact <a href="mailto:info@kbklegacyshield.com" className="text-primary underline">info@kbklegacyshield.com</a>
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default StressTestResume;
