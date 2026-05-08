import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedSection from "@/components/AnimatedSection";
import FINCalculator from "@/components/calculators/FINCalculator";
import DIMECalculator from "@/components/calculators/DIMECalculator";

const Calculators = () => {
  usePageTitle("Financial Calculators");
  const [activeTab, setActiveTab] = useState("fin");

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-primary">
            Financial Calculators
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Use our interactive calculators to discover your Financial Independence Number and 
            determine how much life insurance protection your family needs.
          </p>
        </section>

        {/* Calculators */}
        <AnimatedSection variant="fade-up">
          <section>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                <TabsTrigger value="fin" className="text-sm font-medium">
                  FIN Calculator
                </TabsTrigger>
                <TabsTrigger value="dime" className="text-sm font-medium">
                  DIME Calculator
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="fin">
                <FINCalculator />
              </TabsContent>
              
              <TabsContent value="dime">
                <DIMECalculator />
              </TabsContent>
            </Tabs>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Calculators;