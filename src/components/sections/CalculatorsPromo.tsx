import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import retirementImage from "@/assets/retirement-planning.jpg";

const CalculatorsPromo = () => {
  return (
    <section className="py-20 bg-background relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: `url(${retirementImage})` }}
      ></div>
      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-primary">
            Know Where You Stand
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Use our interactive calculators to discover your Financial Independence Number 
            and determine how much protection your family needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FIN Calculator Card */}
          <Card className="shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-2 h-full">
            <CardContent className="p-8 text-center flex flex-col h-full">
              <div>
                <div className="bg-sky-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-sky-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4 text-primary">
                  Financial Independence Number
                </h3>
                <p className="text-foreground/80 mb-6 leading-relaxed">
                  Calculate exactly how much you need to save for retirement and the monthly 
                  savings required to reach financial independence.
                </p>
              </div>
              <div className="mt-auto">
                <Button 
                  size="lg" 
                  className="w-full bg-sky-primary hover:bg-sky-primary/90 text-navy-primary font-heading font-semibold shadow-button"
                  asChild
                >
                  <Link to="/calculators">
                    <Calculator className="mr-2 h-5 w-5" />
                    Calculate Your FIN
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* DIME Calculator Card */}
          <Card className="shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-2 h-full">
            <CardContent className="p-8 text-center flex flex-col h-full">
              <div>
                <div className="bg-purple-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-purple-accent" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4 text-primary">
                  DIME Protection Calculator
                </h3>
                <p className="text-foreground/80 mb-6 leading-relaxed">
                  Determine how much life insurance protection your family needs using our 
                  comprehensive DIME method analysis.
                </p>
              </div>
              <div className="mt-auto">
                <Button 
                  size="lg" 
                  className="w-full bg-purple-accent hover:bg-purple-accent/90 text-white font-heading font-semibold shadow-button"
                  asChild
                >
                  <Link to="/calculators">
                    <Shield className="mr-2 h-5 w-5" />
                    Calculate Your Protection
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-foreground/60 mb-4">
            Get instant results and personalized recommendations
          </p>
          <p className="text-sm text-foreground/50">
            No personal information required • Results in seconds • Free to use
          </p>
        </div>
      </div>
    </section>
  );
};

export default CalculatorsPromo;