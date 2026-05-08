import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Heart, Lightbulb, TreePine, Mountain, Handshake, Compass, HandHeart } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { openBookingLink } from "@/lib/booking";

const CoreValues = () => {
  usePageTitle("Our Core Values");
  const values = [
    {
      icon: HandHeart,
      title: "Stewardship Over Sales",
      description: "We honor people over profit. Every recommendation is rooted in integrity and service.",
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    },
    {
      icon: Shield,
      title: "Protection Before Prosperity",
      description: "True wealth begins with safety. A strong foundation comes first.",
      color: "text-purple-accent",
      bgColor: "bg-purple-accent/10"
    },
    {
      icon: Lightbulb,
      title: "Clarity That Empowers",
      description: "We teach in a way that removes confusion and builds confidence.",
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    },
    {
      icon: TreePine,
      title: "Transformation Through Knowledge",
      description: "Knowledge is the seed. Stewardship is the soil. Legacy is the harvest.",
      color: "text-purple-accent",
      bgColor: "bg-purple-accent/10"
    },
    {
      icon: Mountain,
      title: "Legacy Mindset, Every Day",
      description: "Legacy is a lifestyle. We help families think generationally and act intentionally.",
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    },
    {
      icon: Heart,
      title: "Faith In Action",
      description: "We are guided by principles that stand firm and shape our decisions with purpose.",
      color: "text-purple-accent",
      bgColor: "bg-purple-accent/10"
    },
    {
      icon: Compass,
      title: "Leadership Through Service",
      description: "We lead by serving. We teach with humility and help develop leaders who multiply impact.",
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Our Core Values
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              These principles guide every decision we make and every family we serve. 
              They are not just words – they are commitments we live by daily.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <AnimatedSection key={index} variant="fade-up" delay={index * 100}>
                    <Card className="shadow-card hover:shadow-button transition-shadow duration-300 h-full">
                      <CardContent className="p-8">
                        <div className={`w-16 h-16 rounded-full ${value.bgColor} flex items-center justify-center mb-6`}>
                          <Icon className={`w-8 h-8 ${value.color}`} />
                        </div>
                        <h3 className="text-2xl font-heading font-bold mb-4 text-primary">
                          {value.title}
                        </h3>
                        <p className="text-lg text-foreground/80 leading-relaxed">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Values in Action Section */}
      <section className="py-20 bg-sky-primary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-primary">
              Values-Driven Approach
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed mb-12">
              At KB&K Legacy Shield, our core values aren't just inspiring statements on a wall—they 
              shape how we work with families, train leaders, and build lasting legacies. When you 
              partner with us, you're choosing a firm that places your family's protection and prosperity 
              above all else.
            </p>
            
            <Card className="shadow-card bg-white">
              <CardContent className="p-10">
                <Handshake className="w-16 h-16 text-purple-accent mx-auto mb-6" />
                <p className="text-2xl font-heading font-semibold text-primary mb-4">
                  Our Promise to You
                </p>
                <p className="text-lg text-foreground/80">
                  We will never recommend a product or strategy unless it aligns with your family's 
                  goals, values, and long-term vision. Your trust is sacred to us, and we treat it 
                  with the respect and responsibility it deserves.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy-primary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready To Build Your Legacy?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Your financial future deserves clarity, confidence, and a strategy that protects your family for generations.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={openBookingLink}
                className="bg-white text-navy-primary border-2 border-navy-primary hover:bg-navy-primary hover:text-white font-heading font-semibold px-12 py-6 text-xl transition-colors duration-200"
              >
                Schedule Your Clarity Call
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoreValues;
