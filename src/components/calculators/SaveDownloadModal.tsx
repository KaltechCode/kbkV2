import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, Mail, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SaveDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  email: string;
  firstName: string;
  reportData: {
    inputs: any;
    results: any;
    scenarios?: any[];
  };
  calculatorType?: "fin" | "dime";
}

export const SaveDownloadModal = ({ 
  open, 
  onOpenChange, 
  leadId,
  email,
  firstName,
  reportData,
  calculatorType = "fin"
}: SaveDownloadModalProps) => {
  const [saving, setSaving] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Save report and email when modal opens
  useEffect(() => {
    if (open && !reportSaved && !saving) {
      saveAndEmail();
    }
  }, [open]);

  const saveAndEmail = async () => {
    setSaving(true);
    try {
      // Save report
      const { data, error } = await supabase.functions.invoke("save-report", {
        body: {
          leadId,
          calculatorType,
          reportData,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to save report");

      setReportSaved(true);

      // Email report
      setEmailing(true);
      const { data: emailData, error: emailError } = await supabase.functions.invoke("email-fin-report", {
        body: { leadId, calculatorType },
      });

      if (emailError) throw emailError;
      if (emailData?.success) {
        setEmailSent(true);
      }
    } catch (error: any) {
      console.error("Error saving/emailing report:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
      setEmailing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {saving || emailing ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <DialogTitle className="text-2xl font-heading text-primary text-center">
                Sending Your Results...
              </DialogTitle>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please wait while we prepare and send your report.
              </p>
            </DialogHeader>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-xl font-heading text-primary text-center leading-snug">
                Your Results Are On The Way — But This Is Only Surface-Level Insight
              </DialogTitle>
              <p className="text-sm text-muted-foreground text-center mt-2">
                This estimate shows what is possible, but it does not reveal what could break your plan.
              </p>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Stress Test Upsell */}
              <div className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-5 space-y-3">
                <h4 className="font-heading font-semibold text-primary text-center">
                  Want to See What This Calculator Missed?
                </h4>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Hidden risks in your financial structure
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Income gaps you may not see
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    Protection weaknesses
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    A clear prioritized action plan
                  </li>
                </ul>

                <Button 
                  size="lg" 
                  className="w-full mt-2"
                  asChild
                >
                  <Link to="/financial-stability-stress-test">
                    Run My Full Financial Stress Test
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Check your inbox in the next 60 seconds.
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full mt-2"
            >
              Close
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};