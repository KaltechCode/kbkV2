import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import familyImage from "@/assets/hero-family-legacy.jpg";

const AboutSnapshot = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatedSection variant="fade-right">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-primary">
                What We Do
              </h2>
              
              <Card className="shadow-card">
                <CardContent className="p-8">
                  <div className="prose prose-lg text-foreground/80 mb-8">
                    <p className="text-xl leading-relaxed mb-6">
                      KB&K Legacy Shield is a purpose-driven financial consulting firm dedicated to 
                      helping families build unshakeable financial foundations. We combine education, 
                      protection strategies, and generational planning to create long-term stability and legacy.
                    </p>
                    
                    <h3 className="text-2xl font-heading font-bold mb-4 text-primary">We Help Families</h3>
                    <ul className="space-y-2 text-lg mb-6">
                      <li className="font-semibold">• Protect their income, assets, and future</li>
                      <li className="font-semibold">• Understand the rules of money with clarity and confidence</li>
                      <li className="font-semibold">• Build stewardship habits that lead to long-term wealth</li>
                      <li className="font-semibold">• Create generational strategies that endure</li>
                      <li className="font-semibold">• Break cycles of financial confusion and instability</li>
                      <li className="font-semibold">• Grow through personalized plans, education, and leadership development</li>
                    </ul>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    asChild
                  >
                    <Link to="/about">
                      Read Our Full Story
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>

          {/* Image */}
          <AnimatedSection variant="fade-left" className="lg:order-last">
            <div className="relative">
              <img 
                src={familyImage} 
                alt="Happy family protected by KB&K Legacy Shield" 
                className="rounded-xl shadow-card w-full object-cover h-[500px]"
              />
              <div className="absolute inset-0 bg-navy-primary/10 rounded-xl"></div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default AboutSnapshot;