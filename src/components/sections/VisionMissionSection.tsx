import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection from "@/components/AnimatedSection";
import visionImage from "@/assets/vision-light-beams.jpg";

const VisionMissionSection = () => {
  return (
    <section className="relative py-20 bg-sky-primary/5">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${visionImage})` }}
      ></div>
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16 text-primary">
            Vision & Mission
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision */}
            <AnimatedSection variant="fade-up" delay={0}>
              <Card className="shadow-card border-l-4 border-l-sky-primary">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-heading font-bold mb-4 text-sky-primary">
                    Our Vision
                  </h3>
                  <p className="text-lg text-foreground/80 leading-relaxed">
                    To see one million families rise from financial fragility into unshakable financial 
                    fortification where uncertainty no longer dictates their future, and legacy 
                    becomes intentional, protected, and passed on with clarity.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Mission */}
            <AnimatedSection variant="fade-up" delay={200}>
              <Card className="shadow-card border-l-4 border-l-purple-accent">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-heading font-bold mb-4 text-purple-accent">
                    Our Mission
                  </h3>
                  <p className="text-lg text-foreground/80 leading-relaxed">
                    We guide individuals and families through the process of identifying financial blind spots, 
                    eliminating vulnerability, and building systems that protect income, preserve 
                    wealth, and secure their legacy for generations.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;
