import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Mail, Calendar, Headphones } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const BookingConfirmed = () => {
  usePageTitle("Consultation Confirmed");

  return (
    <div className="py-20 min-h-[70vh]">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection variant="fade-up">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-accent mx-auto" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary">
              Your Consultation Is Confirmed
            </h1>

            {/* Subheading */}
            <p className="text-xl text-foreground/80 mb-12">
              Thank you for scheduling your Financial Clarity Consultation. You are all set.
            </p>

            {/* What Happens Next Card */}
            <Card className="shadow-card mb-10">
              <CardContent className="p-8">
                <h2 className="text-2xl font-heading font-semibold text-primary mb-6 text-left">
                  What Happens Next
                </h2>
                <ul className="space-y-5 text-left">
                  <li className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">
                      You will receive a confirmation email with your meeting details and link
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">
                      Please add the meeting to your calendar if you have not already
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Headphones className="h-6 w-6 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">
                      Join from a quiet place at your scheduled time
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Reassurance Statement */}
            <p className="text-lg text-foreground/80 italic mb-10">
              This is a brief, educational conversation focused on clarity and next steps. No preparation is required.
            </p>

            {/* Brand Reinforcement */}
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 mb-10">
              <p className="text-foreground/80">
                At KB&K Legacy Shield, our mission is to help individuals and families protect what matters most and reduce exposure to financial uncertainty—one clear decision at a time.
              </p>
            </div>

            {/* Return Home Button */}
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-button"
            >
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default BookingConfirmed;
