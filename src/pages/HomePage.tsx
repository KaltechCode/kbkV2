import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/sections/HeroSection";
import AboutSnapshot from "@/components/sections/AboutSnapshot";
import BrandPromiseSection from "@/components/sections/BrandPromiseSection";
import ServicesPreview from "@/components/sections/ServicesPreview";
import WhyUsSection from "@/components/sections/WhyUsSection";
import CalculatorsPromo from "@/components/sections/CalculatorsPromo";
import FinalCTA from "@/components/sections/FinalCTA";

const HomePage = () => {
  usePageTitle();
  return (
    <div className="space-y-0">
      <HeroSection />
      <div id="about">
        <AboutSnapshot />
      </div>
      <div id="brand-promise">
        <BrandPromiseSection />
      </div>
      <div id="services">
        <ServicesPreview />
      </div>
      <div id="why-us">
        <WhyUsSection />
      </div>

      {/* Mid-page CTA after Why Financial Planning Matters */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-navy-primary border-2 border-navy-primary hover:bg-navy-primary hover:text-white font-heading font-semibold px-8 py-6 text-lg transition-colors"
            >
              <a href="/financial-stability-stress-test">
                Get Your Financial Stability Score
              </a>
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">See what your finances look like under pressure – takes less than 60 seconds.</p>
          </div>
        </div>
      </section>

      <div id="calculators">
        <CalculatorsPromo />
      </div>
      <FinalCTA />
    </div>
  );
};

export default HomePage;