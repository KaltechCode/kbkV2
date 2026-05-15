import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import heroImage from "@/assets/hero-family-legacy.jpg";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-hero text-white py-20 lg:py-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      <div className="absolute inset-0 bg-navy-primary/60"></div>
      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
            <span className="text-sky-primary">
              Build a Financial Structure That Protects Your Family Before You
              Build Wealth
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            We help families move from financial fragility to financial strength
            through protection, structure, and long-term planning.
          </p>

          {/* CTA Definition */}
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto md:text-base">
            Your Financial Stability Score shows how prepared your finances are
            for real-life disruption – job loss, emergencies, or the unexpected.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col items-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-white text-navy-primary border-2 border-navy-primary hover:bg-navy-primary hover:text-white font-heading font-semibold px-8 py-6 text-lg transition-colors"
            >
              <a href="/financial-stability-stress-test#intake-form">
                Get Your Financial Stability Score
              </a>
            </Button>
            <p className="mt-3 text-sm text-white/70">
              See what your finances look like under pressure – takes less than
              60 seconds.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <AnimatedSection variant="fade-up" delay={100}>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-heading font-bold mb-2">15+</div>
                <div className="text-white/80">Years Experience</div>
              </div>
            </AnimatedSection>
            <AnimatedSection variant="fade-up" delay={200}>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-heading font-bold mb-2">500+</div>
                <div className="text-white/80">Families Protected</div>
              </div>
            </AnimatedSection>
            <AnimatedSection variant="fade-up" delay={300}>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-heading font-bold mb-2">
                  $50M+
                </div>
                <div className="text-white/80">Assets Managed</div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <ArrowRight className="h-6 w-6 text-white/60 rotate-90" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
