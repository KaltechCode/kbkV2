import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getInvisibleTurnstileToken } from "@/lib/turnstileInvisible";
import {
  Loader2,
  Mail,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface EmailVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  firstName: string;
  onVerified: (
    leadId: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => void;
  onResendCode: () => void;
}

export const EmailVerificationModal = ({
  open,
  onOpenChange,
  email,
  firstName,
  onVerified,
  onResendCode,
}: EmailVerificationModalProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [turnstileFailed, setTurnstileFailed] = useState(false);

  // SECURITY: Single generic message for ALL OTP verification failures.
  // Never surface raw backend errors — that leaks state to attackers.
  const GENERIC_OTP_ERROR =
    "Invalid or expired code. Please try again or request a new one.";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      setTurnstileFailed(false);
      const { data, error } = await supabase.functions.invoke(
        "verify-email-code",
        {
          body: {
            email: email,
            code: code.trim(),
          },
        },
      );

      // SECURITY: Treat any non-success (including non-2xx errors) as a generic
      // OTP failure. Do NOT surface backend error messages.
      if (error || !data?.success) {
        if (error) {
          console.error(
            "[EmailVerificationModal] verify-email-code error:",
            error,
          );
        }
        toast.error(GENERIC_OTP_ERROR);
        return;
      }

      {
        // Store verification in session
        sessionStorage.setItem("fin_verified_email", email);
        sessionStorage.setItem("fin_lead_id", data.leadId);
        sessionStorage.setItem("fin_first_name", data.firstName);
        sessionStorage.setItem("fin_last_name", data.lastName);

        toast.success("Email verified successfully!");
        onVerified(data.leadId, data.email, data.firstName, data.lastName);
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("[EmailVerificationModal] Error verifying code:", {
        name: error?.name,
        message: error?.message,
        cause: error?.cause,
      });
      toast.error(GENERIC_OTP_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      onResendCode();
      toast.success("New verification code sent!");
      setCode("");
      setTurnstileFailed(false);
    } catch (error) {
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-heading text-primary text-center">
            Verify Your Email
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            We sent a 6-digit code to your email. Enter it below to receive your
            results.
          </p>
        </DialogHeader>

        <form onSubmit={handleVerify} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-center block">
              <ShieldCheck className="inline w-4 h-4 mr-1" />
              Verification Code
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              disabled={loading}
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Code expires in 10 minutes
            </p>
          </div>

          {turnstileFailed && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-2">
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  Bot verification timed out. Request a new code and try again —
                  no need to start over.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={resending || loading}
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending new code...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend verification code
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              disabled={resending || loading}
              className="text-sm"
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                "Didn't receive the code? Resend"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
