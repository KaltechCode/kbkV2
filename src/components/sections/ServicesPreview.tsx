import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, GraduationCap, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const ServicesPreview = () => {
  const services = [
    {
      icon: Shield,
      title: "Life Insurance & Protection Strategies",
      description: "Build an unshakeable foundation that shields your family from uncertainty.",
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    },
    {
      icon: TrendingUp,
      title: "Annuities & Long-Term Wealth Planning",
      description: "Create guaranteed income streams that last throughout retirement.",
      color: "text-purple-accent",
      bgColor: "bg-purple-accent/10"
    },
    {
      icon: GraduationCap,
      title: "Legacy Preservation & Estate Education",
      description: "Transform wealth into a legacy that strengthens generations.",
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    },
    {
      icon: BookOpen,
      title: "Financial Literacy & Family Planning",
      description: "Understand the rules of money and build lasting security habits.",
      color: "text-purple-accent",
      bgColor: "bg-purple-accent/10"
    },
    {
      icon: Users,
      title: "Leadership Development",
      description: "Building community leaders who multiply impact through service.",
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    }
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-primary">
            Our Core Solutions
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Comprehensive strategies designed to guide families from knowledge to lasting legacy. 
            Every solution is rooted in stewardship, protection, and generational thinking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <AnimatedSection key={index} variant="fade-up" delay={index * 100}>
                <Card className="shadow-card hover:shadow-button transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`${service.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className={`h-8 w-8 ${service.color}`} />
                    </div>
                    <h3 className="font-heading font-semibold text-primary mb-3 text-sm leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-foreground/70 text-sm">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-button"
            asChild
          >
            <Link to="/services">
              Explore All Solutions
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;