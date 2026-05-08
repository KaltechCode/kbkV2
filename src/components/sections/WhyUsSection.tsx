import { Card, CardContent } from "@/components/ui/card";
import { Users, FileX, TrendingDown, Clock } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import planningImage from "@/assets/financial-planning.jpg";

const WhyUsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "42%",
      label: "of American families say they need more life insurance",
      source: "LIMRA 2024",
      color: "text-red-500"
    },
    {
      icon: FileX,
      value: "47%",
      label: "of Americans don't have a written financial plan",
      source: "Allianz Life 2025",
      color: "text-orange-500"
    },
    {
      icon: TrendingDown,
      value: "56%",
      label: "worry their retirement savings won't last",
      source: "AARP 2024",
      color: "text-yellow-600"
    },
    {
      icon: Clock,
      value: "53%",
      label: "of Americans feel behind on retirement planning",
      source: "CNBC 2024",
      color: "text-blue-600"
    }
  ];

  return (
    <section className="py-20 bg-gray-light relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: `url(${planningImage})` }}
      ></div>
      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Statistics */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-primary">
              Why Financial Planning Matters
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              The statistics are alarming, but there's hope. Proper planning makes all the difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <AnimatedSection key={index} variant="scale-up" delay={index * 100}>
                  <Card className="shadow-card text-center hover:shadow-lg transition-shadow duration-300 h-full">
                    <CardContent className="p-8">
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <IconComponent className={`h-8 w-8 ${stat.color}`} />
                      </div>
                      <div className="text-4xl font-heading font-bold text-primary mb-4">
                        {stat.value}
                      </div>
                      <p className="text-foreground/80 text-sm leading-relaxed mb-2">
                        {stat.label}
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        Source: {stat.source}
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>

        {/* Quote Callout */}
        <AnimatedSection variant="slide-up">
          <div className="max-w-4xl mx-auto">
            <div className="bg-purple-accent text-white py-16 px-8 md:px-16 rounded-2xl text-center shadow-lg">
              <blockquote className="text-2xl md:text-4xl font-heading font-bold mb-6 leading-tight">
                "Preparation is proactive. Control is reactive."
              </blockquote>
              <cite className="text-xl md:text-2xl opacity-90">
                — From Fragile to Fortified
              </cite>
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                  Don't become another statistic. Take control of your financial future today.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default WhyUsSection;