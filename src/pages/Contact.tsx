import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { openBookingLink } from "@/lib/booking";
import { supabase } from "@/integrations/supabase/client";
import { getInvisibleTurnstileToken } from "@/lib/turnstileInvisible";
const Contact = () => {
  usePageTitle("Contact Us");
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-contact-email",
        {
          body: { ...formData },
        },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Message Sent!",
        description:
          "We'll get back to you within 24 hours to schedule your free consultation.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      console.error("Contact form error:", err);
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-primary">
            Contact Us
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Ready to take the first step toward financial security? Get in touch
            to schedule your complimentary consultation.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-heading text-primary">
                Send Us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1"
                    placeholder="Tell us about your financial goals and how we can help..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-button"
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl font-heading text-primary">
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-foreground/80">(706) 200-2359</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-foreground/80">
                      info@kbklegacyshield.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium">Office Address</h4>
                    <p className="text-foreground/80">
                      4434 Columbia Rd Ste. 101
                      <br />
                      Martinez, GA 30907
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h4 className="font-medium">Business Hours</h4>
                    <p className="text-foreground/80">
                      Monday - Friday: 9:00 AM - 6:00 PM
                      <br />
                      Saturday: By Appointment Only
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-accent/5 border-accent/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-heading font-bold mb-4 text-primary">
                  Free 30-Minute Consultation
                </h3>
                <p className="text-foreground/80 mb-6">
                  No obligation. No sales pressure. Just honest advice about
                  your financial future.
                </p>
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-button"
                  onClick={openBookingLink}
                >
                  Schedule Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <AnimatedSection variant="fade-up" delay={200}>
          <section className="mt-16">
            <Card className="shadow-card overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-heading text-primary">
                  Visit Our Office
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[450px]">
                  <iframe
                    src="https://maps.google.com/maps?q=4434+Columbia+Rd+Ste.+101,Martinez,GA+30907&output=embed"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="KB&K Legacy Shield Office Location"
                  />
                </div>
                <div className="p-6 bg-gray-light">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="font-heading font-semibold text-primary mb-1">
                        KB&K Legacy Shield
                      </h4>
                      <p className="text-foreground/80">
                        4434 Columbia Rd Ste. 101
                        <br />
                        Martinez, GA 30907
                      </p>
                    </div>
                    <Button
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      asChild
                    >
                      <a
                        href="https://www.google.com/maps/dir/?api=1&destination=4434+Columbia+Rd+Ste.+101,Martinez,GA+30907"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Directions
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
};
export default Contact;
