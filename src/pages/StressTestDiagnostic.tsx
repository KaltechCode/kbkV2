import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck, Loader2, ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getInvisibleTurnstileToken } from "@/lib/turnstileInvisible";

type Step = "email" | "otp";

const StressTestDiagnostic = () => {
  usePageTitle("Stress Test — Verify Access");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check for existing session token on mount
  useEffect(() => {
    const checkSessionToken = async () => {
      const sessionToken = sessionStorage.getItem("intake_session_token");

      if (sessionToken) {
        try {
          const { data, error: fnError } = await supabase.functions.invoke(
            "validate-intake-session",
            { body: { session_token: sessionToken } }
          );

          if (!fnError && data?.valid && data?.intake_id) {
            sessionStorage.setItem("diagnostic_intake_id", data.intake_id);
            // Keep intake_session_token for submission authentication
            if (data.prefill) {
              sessionStorage.setItem("diagnostic_prefill", JSON.stringify(data.prefill));
            }
            navigate("/detailed-diagnostic", { replace: true });
            return;
          }
        } catch {
          // Session validation failed
        }
        sessionStorage.removeItem("intake_session_token");
      }

      setCheckingSession(false);
    };

    checkSessionToken();
  }, [navigate]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  // Phase 1: Request OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const turnstile_token = await getInvisibleTurnstileToken();
      const { data, error: fnError } = await supabase.functions.invoke(
        "verify-diagnostic-access",
        { body: { email: trimmed, action: "send_code", turnstile_token } }
      );

      if (fnError) {
        setError("Something went wrong. Please try again.");
        return;
      }

      if (data?.code_sent) {
        setStep("otp");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Phase 2: Verify OTP
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpValue.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const turnstile_token = await getInvisibleTurnstileToken();
      const { data, error: fnError } = await supabase.functions.invoke(
        "verify-diagnostic-access",
        { body: { email: email.trim().toLowerCase(), action: "verify_code", code: otpValue, turnstile_token } }
      );

      if (fnError) {
        setError("Something went wrong. Please try again.");
        return;
      }

      if (data?.verified && data?.intake_id) {
        sessionStorage.setItem("diagnostic_intake_id", data.intake_id);
        // Store session token from OTP verification for submission auth
        if (data.session_token) {
          sessionStorage.setItem("intake_session_token", data.session_token);
        }
        if (data.prefill) {
          sessionStorage.setItem("diagnostic_prefill", JSON.stringify(data.prefill));
        }
        navigate("/detailed-diagnostic", { replace: true });
      } else {
        setError(data?.error || "Invalid or expired code. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <AnimatedSection variant="fade-up">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 md:p-10">
          {step === "email" ? (
            <>
              <div className="text-center mb-8">
                <ShieldCheck className="h-14 w-14 text-primary mx-auto mb-4" />
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-2">
                  Verify Your Access
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter the email address you used when completing your Financial
                  Stability Stress Test. We'll send a verification code to confirm your identity.
                </p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="verify-email">Email Address</Label>
                  <Input
                    id="verify-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive leading-snug">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code…
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <Mail className="h-14 w-14 text-primary mx-auto mb-4" />
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-2">
                  Enter Verification Code
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We sent a 6-digit code to <strong className="text-foreground">{email}</strong>.
                  Check your inbox and enter it below.
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={(value) => setOtpValue(value)}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="text-sm text-destructive leading-snug text-center">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading || otpValue.length !== 6}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtpValue("");
                      setError("");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Change email
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      setOtpValue("");
                      setError("");
                      handleSendCode(e as unknown as React.FormEvent);
                    }}
                    disabled={loading}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
};

export default StressTestDiagnostic;
