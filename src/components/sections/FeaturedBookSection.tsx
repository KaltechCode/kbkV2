import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection from "@/components/AnimatedSection";
import bookCover from "@/assets/fragile-to-fortified-cover.png";

const FeaturedBookSection = () => {
  return (
    <section id="featured-book" className="mb-20">
      <AnimatedSection variant="fade-up" duration="normal">
        <Card className="overflow-hidden shadow-card">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Book Cover - Left/Top */}
              <div className="md:p-12 p-8 flex justify-center bg-secondary/30">
                <img
                  src={bookCover}
                  alt="From Fragile to Fortified Book Cover"
                  className="w-full max-w-[300px] md:max-w-[350px] shadow-card rounded-lg"
                />
              </div>

              {/* Content - Right/Bottom */}
              <div className="md:p-12 p-8 md:pl-0">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-primary">
                  Featured Resource: From Fragile to Fortified
                </h2>
                
                <blockquote className="text-xl md:text-2xl font-semibold mb-6 text-foreground">
                  <em>"I'll do it later"</em> is the most expensive sentence in personal finance.
                </blockquote>

                <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                  <strong>From Fragile to Fortified</strong> is a clear, faith-rooted roadmap for anyone seeking real financial security. 
                  It uncovers why so many families remain vulnerable, and it lays out the steps to build a future that is steady, 
                  intentional, and fortified. If you want the mindset, the biblical insight, and the strategy to protect what 
                  matters most, this book is where you begin.
                </p>

                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">
                    Take the Next Step
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      className="bg-[#5A2DAF] hover:bg-[#4A1D8F] text-white shadow-button"
                      asChild
                    >
                      <a href="https://fromfragiletofortified.com" target="_blank" rel="noopener noreferrer">
                        Discover the Book
                      </a>
                    </Button>
                    
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-[#3BB0E8] text-[#3BB0E8] hover:bg-[#3BB0E8] hover:text-white shadow-button"
                      asChild
                    >
                      <a href="https://fromfragiletofortified.com" target="_blank" rel="noopener noreferrer">
                        Get a Free Sample Chapter
                      </a>
                    </Button>
                  </div>

                  <p className="text-sm text-foreground/60 italic mt-4">
                    Full details, ordering options, and bonuses available on the official book website
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>
    </section>
  );
};

export default FeaturedBookSection;
