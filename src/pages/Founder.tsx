import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import kingsleyPortrait from "@/assets/kingsley-portrait.png";

const Founder = () => {
  usePageTitle("Meet Our Founder");
  const engineeringLessons = [
    "How to build systems",
    "How to think long-term",
    "How to create structures that withstand pressure",
    "How to solve complex problems with elegant solutions"
  ];

  const consultingLessons = [
    "How to protect families",
    "How to communicate truth with clarity",
    "How to simplify money without diluting its importance",
    "How to help people move from fragility to fortification"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Portrait */}
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-primary/20 rounded-2xl transform rotate-3"></div>
                  <img 
                    src={kingsleyPortrait} 
                    alt="Kingsley Ekinde - Founder of KB&K Legacy Shield" 
                    className="relative rounded-2xl shadow-card w-full object-cover"
                  />
                </div>
              </div>

              {/* Name & Title */}
              <div className="order-1 md:order-2">
                <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4">
                  Kingsley Ekinde
                </h1>
                <p className="text-2xl md:text-3xl text-sky-primary mb-6 font-heading">
                  Founder of KB&K Legacy Shield
                </p>
                <p className="text-xl text-white/90">
                  Engineer, Financial Consultant, AI Consultant, Lifelong Learner
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-12 text-primary text-center">
              My Journey to Financial Consulting
            </h2>

            <div className="space-y-6 text-lg leading-relaxed text-foreground/80">
              <p>
                I did not set out to build a financial consulting firm. I set out to understand why 
                families like mine – hardworking, intelligent, committed – were still vulnerable when life 
                shifted without warning.
              </p>

              <p className="font-semibold text-xl text-primary">
                My journey begins in 2013, when I lost my father.
              </p>

              <p>
                It was more than a personal loss. It was an awakening. A sobering realization that even 
                the strongest families can crumble financially when preparation is missing. That moment 
                forced me to confront a hard truth:
              </p>

              <Card className="bg-purple-accent/5 border-l-4 border-l-purple-accent">
                <CardContent className="p-6">
                  <p className="text-xl font-semibold text-primary italic">
                    Most families are one crisis away from collapse, not because they lack intelligence, 
                    but because no one ever taught them the rules.
                  </p>
                </CardContent>
              </Card>

              <p>
                For nearly two decades, I lived as an engineer. Eighteen years in the automotive and 
                aerospace industries. Designing systems. Solving problems. Leading multi-million-dollar 
                projects from cradle to grave. Serving as a Subject Matter Expert in vehicle 
                electrification, systems integration, wiring design strategies, troubleshooting, and 
                manufacturing support.
              </p>

              <p>
                I was known as the man who could bring clarity where others saw complexity. Yet behind 
                the scenes, my own finances told a different story.
              </p>

              <p className="font-semibold text-foreground">
                Despite the titles, the degrees, and the accomplishments, I was living paycheck to 
                paycheck. Disciplined professionally, but financially fragile personally.
              </p>

              <p>Then something shifted.</p>

              <p>
                I pursued a Master's degree in Management with an emphasis in Technology Management. I devoured 
                everything I could about leadership, stewardship, and financial literacy. I started to 
                recognize that the real problem for most families was not lack of income – it was lack of 
                knowledge, lack of guidance, and lack of a foundation that could withstand life's volatility.
              </p>

              <p>
                What began as curiosity became conviction. What began as learning became calling.
              </p>

              <p className="font-semibold text-xl text-primary">
                That calling eventually became KB&K Legacy Shield.
              </p>

              <p>
                I built this firm to shield families from the very vulnerability I once lived. To teach 
                what I was never taught. To illuminate what most people never see. To help households 
                protect what matters, build what lasts, and rise into generational strength.
              </p>

              <p>
                Today, I serve as both an engineer and a financial professional – two worlds that actually 
                complement each other more than people realize.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Worlds Section */}
      <section className="py-20 bg-sky-primary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Engineering */}
              <Card className="shadow-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-heading font-bold mb-6 text-navy-primary">
                    Engineering taught me:
                  </h3>
                  <ul className="space-y-4">
                    {engineeringLessons.map((lesson, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-6 w-6 text-sky-primary flex-shrink-0 mt-0.5" />
                        <span className="text-lg text-foreground/80">{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Financial Consulting */}
              <Card className="shadow-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-heading font-bold mb-6 text-purple-accent">
                    Financial consulting taught me:
                  </h3>
                  <ul className="space-y-4">
                    {consultingLessons.map((lesson, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-6 w-6 text-purple-accent flex-shrink-0 mt-0.5" />
                        <span className="text-lg text-foreground/80">{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-cta text-white shadow-card">
              <CardContent className="p-8 text-center">
                <p className="text-2xl font-heading font-semibold">
                  Together, these perspectives shaped my mission:
                </p>
                <p className="text-3xl font-heading font-bold mt-4">
                  To guide families from knowledge to lasting legacy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-heading font-bold mb-8 text-primary text-center">
              My Commitment
            </h2>

            <div className="space-y-6 text-lg leading-relaxed text-foreground/80">
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-sky-primary flex-shrink-0 mt-1" />
                  <span>
                    I will empower one million families to live well shielded from financial volatility.
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-sky-primary flex-shrink-0 mt-1" />
                  <span>
                    I will develop one hundred leaders earning half a million dollars annually who will 
                    carry this mission into their communities.
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-sky-primary flex-shrink-0 mt-1" />
                  <span>
                    And I will continue teaching, serving, and learning because legacy is not built in 
                    a moment. Legacy is built in a lifestyle.
                  </span>
                </li>
              </ul>

              <p className="pt-6">
                I am a husband, a father of two amazing daughters, and a man driven by faith, 
                stewardship, and responsibility. I believe every household – regardless of background – deserves 
                the chance to build a future that stands firm.
              </p>

              <Card className="bg-navy-primary text-white border-0">
                <CardContent className="p-8">
                  <p className="text-xl font-semibold italic">
                    "You are the screenwriter, director, and actor of your financial life. My role is 
                    to guide you toward a script your children and grandchildren will thank you for."
                  </p>
                </CardContent>
              </Card>

              <p className="text-2xl font-heading font-semibold text-primary text-center pt-6">
                Welcome to KB&K Legacy Shield. Let us build what lasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-cta text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to Start Your Legacy Journey?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Schedule a complimentary consultation and discover how we can help protect your family's future.
            </p>
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Founder;
