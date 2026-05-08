import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const FinalCTA = () => {
  const benefits = [
    "No obligation consultation",
    "Personalized financial strategy",
    "Expert guidance and recommendations",
    "Clear next steps for your goals"
  ];

  return (
    <section className="py-20 bg-navy-primary text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection variant="slide-up">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 leading-tight">
              Ready To Build Your Legacy?
            </h2>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Your financial future deserves clarity, confidence, and a strategy that protects 
              your family for generations.
            </p>

            {/* Benefits List */}
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 text-left">
                  <CheckCircle className="h-5 w-5 text-sky-primary flex-shrink-0" />
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-white text-navy-primary border-2 border-navy-primary hover:bg-navy-primary hover:text-white font-heading font-semibold px-12 py-6 text-xl transition-colors"
              >
                <a href="https://tidycal.com/kingsley-ekinde/30-minute-meeting-1vr60yy" target="_blank" rel="noopener noreferrer">
                  Schedule Your Clarity Call
                </a>
              </Button>
            </div>

            <div className="mt-8 text-white/70">
              <p className="text-lg">
                Call us directly: <span className="font-semibold text-sky-primary">(706) 200-2359</span>
              </p>
              <p className="text-sm mt-2">
                Usually available within 24 hours • Evening appointments available
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FinalCTA;