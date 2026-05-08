import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Heart, Lightbulb, TreePine, Mountain, Compass, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import oakTreeImage from "@/assets/oak-tree-roots.jpg";
import VisionMissionSection from "@/components/sections/VisionMissionSection";

const About = () => {
  usePageTitle("About Us");
  const coreValues = [
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
              About KB&K Legacy Shield
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Empowering families to rise from financial fragility to financial fortification
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <VisionMissionSection />

      {/* Our Story */}
      <section className="py-20 bg-sky-primary/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div className="order-2 lg:order-1">
                <img 
                  src={oakTreeImage} 
                  alt="Oak tree with deep roots symbolizing legacy and stability" 
                  className="rounded-2xl shadow-card w-full object-cover"
                />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl font-heading font-bold mb-8 text-primary">
                  Our Story
                </h2>
                <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
              <p>
                KB&K Legacy Shield exists to help families rise from financial fragility to financial 
                fortification. Founded on the belief that every household deserves clarity, protection, 
                and a path to build what lasts, the firm is committed to providing purpose-driven financial 
                guidance rooted in stewardship and generational thinking.
              </p>

              <p>
                From its inception, KB&K Legacy Shield has focused on one mission: to empower one million 
                families to live well shielded from financial volatility.
              </p>

              <p>
                The company was formed from a deep recognition of a widespread challenge facing families today: 
                many are one unexpected event away from crisis, not because they lack intelligence or discipline, 
                but because they lack the knowledge and tools needed to build lasting security. KB&K Legacy Shield 
                was created to close this gap with education, wisdom, and strategies that help families protect 
                what matters most.
              </p>

                  <p>
                    The firm's work centers on guiding families from knowledge to lasting legacy. Through financial 
                    literacy, protection planning, wealth-building strategies, and generational coaching, KB&K helps 
                    households create strong foundations that can withstand life's uncertainties.
                  </p>

                  <Card className="bg-gradient-cta text-white border-0">
                    <CardContent className="p-6 text-center">
                      <p className="text-lg font-semibold">
                        With a focus on developing future leaders, strengthening communities, and guiding families 
                        toward wise, intentional financial decisions, KB&K Legacy Shield stands as a beacon of stability, 
                        clarity, and legacy.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-primary">
                Our Core Values
              </h2>
              <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
                These principles guide every decision we make and every family we serve
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {coreValues.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="shadow-card hover:shadow-button transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-full ${value.bgColor} flex items-center justify-center mb-4`}>
                        <Icon className={`w-7 h-7 ${value.color}`} />
                      </div>
                      <h3 className="text-xl font-heading font-bold mb-3 text-primary">
                        {value.title}
                      </h3>
                      <p className="text-foreground/80 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-purple-accent text-purple-accent hover:bg-purple-accent hover:text-white"
                asChild
              >
                <Link to="/core-values">
                  Explore Our Values in Detail
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Founder Preview */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Meet Our Founder
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Kingsley Ekinde brings a unique perspective combining 18 years of engineering excellence 
              with deep financial expertise and a passion for empowering families.
            </p>
            <Button 
              size="lg"
              className="bg-white text-navy-primary hover:bg-white/90 font-heading font-semibold px-12 py-6 text-xl"
              asChild
            >
              <Link to="/founder">
                Read Kingsley's Story
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold mb-6 text-primary">
              Ready to Build Your Legacy?
            </h2>
            <p className="text-xl mb-8 text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Your financial future deserves clarity, confidence, and a strategy that protects your 
              family for generations.
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
