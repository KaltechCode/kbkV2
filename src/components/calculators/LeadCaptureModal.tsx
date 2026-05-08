import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, User, Phone } from "lucide-react";
import { TurnstileWidget } from "./TurnstileWidget";

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationRequired: (email: string, firstName: string) => void;
}


export const LeadCaptureModal = ({ open, onOpenChange, onVerificationRequired }: LeadCaptureModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    // Clear turnstile error if it exists
    if (errors.turnstile) {
      setErrors(prev => ({ ...prev, turnstile: "" }));
    }
  }, [errors.turnstile]);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken("");
    setErrors(prev => ({ ...prev, turnstile: "Verification failed. Please try again." }));
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken("");
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!turnstileToken) {
      newErrors.turnstile = "Please complete the verification and try again.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call secure edge function to create lead with rate limiting
      const { data, error } = await supabase.functions.invoke("create-lead", {
        body: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          turnstile_token: turnstileToken,
        },
      });

      if (error) {
        console.error("Error creating lead:", error);
        throw new Error(error.message || "Failed to create lead");
      }

      if (!data?.success) {
        // Check for turnstile-specific errors
        if (data?.error?.includes("verification")) {
          setErrors(prev => ({ ...prev, turnstile: "Verification failed. Please try again." }));
          setTurnstileToken("");
          throw new Error("Verification failed. Please try again.");
        }
        throw new Error(data?.error || "Failed to create lead");
      }

      toast.success("Verification code sent to your email!");
      onVerificationRequired(formData.email.trim().toLowerCase(), formData.firstName.trim());
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-primary">
            Where Should We Send Your Results?
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your details to verify your email and receive your personalized results.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                <User className="inline w-4 h-4 mr-1" />
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="John"
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                <User className="inline w-4 h-4 mr-1" />
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Doe"
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="inline w-4 h-4 mr-1" />
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Cloudflare Turnstile Widget */}
          <div className="space-y-2">
            <TurnstileWidget
              onVerify={handleTurnstileVerify}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
            />
            {errors.turnstile && (
              <p className="text-sm text-destructive text-center">{errors.turnstile}</p>
            )}
          </div>

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
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          We respect your privacy. Your information is secure and will never be shared.
        </p>
      </DialogContent>
    </Dialog>
  );
};
