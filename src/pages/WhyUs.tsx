import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Award, Users, TrendingUp } from "lucide-react";
import FeaturedBookSection from "@/components/sections/FeaturedBookSection";
import { openBookingLink } from "@/lib/booking";

const WhyUs = () => {
  usePageTitle("Why Choose Us");
  const stats = [
    { value: "42%", label: "of families say they need more life insurance", source: "LIMRA 2024", icon: Users },
    { value: "47%", label: "don't have a written financial plan", source: "Allianz Life 2025", icon: TrendingUp },
    { value: "15+", label: "years of combined experience", icon: Award },
    { value: "500+", label: "families protected and served", icon: CheckCircle }
  ];

  const advantages = [
    "Comprehensive approach to wealth building and protection",
    "Personalized strategies tailored to your unique situation", 
    "Proven methodologies backed by industry research",
    "Transparent fee structure with no hidden costs",
    "Ongoing support and regular strategy reviews",
    "Access to exclusive financial products and strategies"
  ];

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-primary">
            The KB&K Legacy Shield Advantage
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Discover why families and professionals choose us to protect their financial future 
            and build lasting generational wealth.
          </p>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="shadow-card text-center">
                  <CardContent className="p-8">
                    <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-accent" />
                    </div>
                    <div className="text-4xl font-heading font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <p className="text-foreground/80">{stat.label}</p>
                    {stat.source && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        Source: {stat.source}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quote Section */}
        <section className="mb-20">
          <div className="bg-purple-accent text-white py-16 px-8 rounded-2xl text-center">
            <blockquote className="text-2xl md:text-3xl font-heading font-bold mb-4">
              "Preparation is proactive. Control is reactive."
            </blockquote>
            <cite className="text-xl opacity-90">— From Fragile to Fortified</cite>
          </div>
        </section>

        {/* Featured Book Section */}
        <FeaturedBookSection />

        {/* Advantages */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold mb-12 text-center text-primary">
              Why Choose KB&K Legacy Shield?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {advantages.map((advantage, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{advantage}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center bg-secondary rounded-2xl p-12">
          <h2 className="text-3xl font-heading font-bold mb-6 text-primary">
            Let's Build Your Plan Together
          </h2>
          <p className="text-xl mb-8 text-foreground/80 max-w-2xl mx-auto">
            Experience the KB&K Legacy Shield difference. Start with a complimentary consultation 
            to discover how we can help secure your financial future.
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-button"
            onClick={openBookingLink}
          >
            Book Your Free 30-Minute Consultation
          </Button>
        </section>
      </div>
    </div>
  );
};

export default WhyUs;