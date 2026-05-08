import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import AnimatedSection from "@/components/AnimatedSection";
import { ClipboardList } from "lucide-react";

const StressTestDiagnosticForm = () => {
  usePageTitle("Stress Test — Detailed Diagnostic");
  const navigate = useNavigate();

  useEffect(() => {
    const intakeId = sessionStorage.getItem("diagnostic_intake_id");
    if (!intakeId) {
      navigate("/stress-test/diagnostic", { replace: true });
    }
  }, [navigate]);

  const intakeId = sessionStorage.getItem("diagnostic_intake_id");
  if (!intakeId) return null;

  return (
    <div className="min-h-screen bg-secondary">
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection variant="fade-up">
            <div className="max-w-2xl mx-auto text-center">
              <ClipboardList className="h-16 w-16 text-accent mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-6">
                Detailed Diagnostic Intake Form
              </h1>
              <p className="text-lg text-foreground/70">
                Coming Next (Phase 2 Build)
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default StressTestDiagnosticForm;
