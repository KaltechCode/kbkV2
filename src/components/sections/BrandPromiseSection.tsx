import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection from "@/components/AnimatedSection";
import handsImage from "@/assets/hands-passing-light.jpg";
import Logo from "@/components/Logo";

const BrandPromiseSection = () => {
  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection variant="scale-up">
            <Card className="shadow-card border-2 border-purple-accent/20 bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0 items-center">
                  <div className="hidden md:block h-full">
                    <img 
                      src={handsImage} 
                      alt="Hands passing light symbolizing legacy transfer" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-12">
                    <Logo variant="dark" size="section" className="mx-auto mb-6 opacity-90" />
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-primary">
                      Our Brand Promise
                    </h2>
                    <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed">
                      We promise to help you turn knowledge into stewardship, stewardship into wealth, 
                      and wealth into a legacy that strengthens generations after you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default BrandPromiseSection;
