import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingUp, GraduationCap, BookOpen, Users } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const Services = () => {
  usePageTitle("Financial Services");
  const solutions = [
    {
      icon: Shield,
      title: "Life Insurance & Protection Strategies",
      description: "Protection before prosperity. Build an unshakeable foundation that shields your family from life's uncertainties. We help you understand how strategic protection creates the security needed for long-term wealth building.",
      benefits: ["Income replacement for your family", "Debt elimination strategies", "Living benefits for critical illness", "Tax-advantaged wealth transfer"],
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    },
    {
      icon: TrendingUp,
      title: "Annuities & Long-Term Wealth Planning",
      description: "Turn stewardship into wealth with guaranteed income strategies. Create reliable income streams that last throughout retirement while protecting your principal from market volatility.",
      benefits: ["Guaranteed lifetime income", "Principal protection", "Tax-deferred growth", "Legacy for beneficiaries"],
      color: "text-purple-accent",
      bgColor: "bg-purple-accent/10"
    },
    {
      icon: GraduationCap,
      title: "Legacy Preservation & Estate Education",
      description: "Transform wealth into a legacy that strengthens generations. We guide you through strategies to efficiently transfer assets, minimize taxes, and ensure your values live on.",
      benefits: ["Estate tax minimization", "Wealth transfer planning", "Trust education and setup", "Multi-generational impact"],
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    },
    {
      icon: BookOpen,
      title: "Financial Literacy & Family Planning",
      description: "Knowledge is the seed, stewardship is the soil. We empower families with clarity through education, helping you understand the rules of money and build habits that create lasting security.",
      benefits: ["Money management fundamentals", "Budget and cash flow strategies", "Debt elimination coaching", "Family financial conversations"],
      color: "text-purple-accent",
      bgColor: "bg-purple-accent/10"
    },
    {
      icon: Users,
      title: "Leadership Development for Financial Professionals",
      description: "Leadership through service. We're building 100+ community leaders earning $500K+ annually who will multiply impact through teaching, mentoring, and serving their communities.",
      benefits: ["Proven business systems", "Mentorship and coaching", "Community building strategies", "Personal and professional growth"],
      color: "text-sky-primary",
      bgColor: "bg-sky-primary/10"
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 animate-fade-in">
              Our Solutions
            </h1>
            <p className="text-xl md:text-2xl text-white/90 animate-fade-in">
              Comprehensive strategies designed to guide families from knowledge to lasting legacy
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="shadow-card border-l-4 border-l-purple-accent">
              <CardContent className="p-10">
                <p className="text-2xl font-heading font-semibold text-primary mb-4">
                  From Knowledge to Stewardship to Legacy
                </p>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  Every solution we offer is designed with one purpose: helping you move from financial 
                  fragility to financial fortification. We don't just provide products, we provide transformation 
                  through clarity, protection, and generational thinking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-sky-primary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-heading font-bold mb-12 text-center text-primary">
              Core Solutions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {solutions.map((solution, index) => {
                const IconComponent = solution.icon;
                return (
                  <AnimatedSection 
                    key={index} 
                    variant={index % 2 === 0 ? "fade-right" : "fade-left"}
                    delay={Math.floor(index / 2) * 100}
                  >
                    <Card className="shadow-card hover:shadow-button transition-all duration-300 hover:-translate-y-1 h-full">
                      <CardHeader>
                        <div className="flex items-start space-x-4">
                          <div className={`${solution.bgColor} p-4 rounded-xl flex-shrink-0`}>
                            <IconComponent className={`h-8 w-8 ${solution.color}`} />
                          </div>
                          <CardTitle className="text-2xl font-heading text-primary">
                            {solution.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* ... keep existing code */}
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-heading font-bold mb-12 text-center text-primary">
              Our Approach
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="shadow-card text-center transition-transform duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className="text-5xl font-bold text-sky-primary mb-4">1</div>
                  <h3 className="text-xl font-heading font-bold mb-3 text-primary">Clarity First</h3>
                  <p className="text-foreground/80">
                    We start by helping you understand where you are, where you want to go, and what's 
                    standing in your way. No confusion, just clear truth.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card text-center transition-transform duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className="text-5xl font-bold text-purple-accent mb-4">2</div>
                  <h3 className="text-xl font-heading font-bold mb-3 text-primary">Protection & Strategy</h3>
                  <p className="text-foreground/80">
                    We build a foundation of protection before pursuing growth. Your family's security 
                    comes first, always.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card text-center transition-transform duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className="text-5xl font-bold text-sky-primary mb-4">3</div>
                  <h3 className="text-xl font-heading font-bold mb-3 text-primary">Generational Impact</h3>
                  <p className="text-foreground/80">
                    We help you create strategies that don't just serve you—they strengthen your children 
                    and grandchildren for decades to come.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-primary text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-center">
              Why Our Solutions Are Different
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-heading font-bold mb-4 text-sky-primary">What We Believe</h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start">
                    <span className="text-sky-primary mr-2">•</span>
                    Stewardship over sales. Your family's wellbeing comes first
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-primary mr-2">•</span>
                    Protection before prosperity. Security is the foundation
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-primary mr-2">•</span>
                    Clarity that empowers. No jargon, just truth
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-primary mr-2">•</span>
                    Legacy thinking is a daily lifestyle, not an afterthought
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold mb-4 text-sky-primary">What You Get</h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start">
                    <span className="text-sky-primary mr-2">•</span>
                    Personalized strategies tailored to your family's goals
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-primary mr-2">•</span>
                    Education that transforms how you think about money
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-primary mr-2">•</span>
                    Ongoing support and guidance as your life changes
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-primary mr-2">•</span>
                    A partner who's committed to your generational success
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold mb-6 text-primary">
              Ready to Build Your Financial Foundation?
            </h2>
            <p className="text-xl mb-8 text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Every family's journey is unique. Let's discuss which solutions are right for your specific 
              situation and goals. Schedule a complimentary clarity call. No pressure, no obligation, just 
              honest conversation about your financial future.
            </p>
            <div className="flex justify-center">
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-2 border-navy-primary text-navy-primary hover:bg-navy-primary hover:text-white font-heading font-semibold px-12 py-6 text-xl"
              >
                <a href="https://tidycal.com/kingsley-ekinde/30-minute-meeting-1vr60yy" target="_blank" rel="noopener noreferrer">
                  Schedule Your Clarity Call
                </a>
              </Button>
            </div>
            <p className="text-sm text-foreground/60 mt-6">
              Usually available within 24 hours • Evening appointments available
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
