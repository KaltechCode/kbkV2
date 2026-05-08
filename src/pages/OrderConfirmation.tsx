import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Mail, Package, XCircle } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";

interface OrderDetails {
  customerName: string;
  productName: string;
  amountPaid: number;
  currency: string;
  paymentStatus: string;
}

function formatCurrency(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

const OrderConfirmation = () => {
  usePageTitle("Order Confirmed");
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("get-checkout-details", {
          body: { session_id: sessionId },
        });

        if (error || !data?.paymentStatus) {
          setStatus("error");
          return;
        }

        setOrder(data as OrderDetails);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    fetchDetails();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-accent mx-auto mb-4 animate-spin" />
          <p className="text-foreground/70">Confirming your order…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center p-8">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4">
            Unable to Confirm Order
          </h1>
          <p className="text-foreground/70 mb-8">
            We could not retrieve your order details. Please check your email for a confirmation, or contact support.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24 min-h-[70vh]">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection variant="fade-up">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-20 w-20 text-accent mx-auto mb-6" />

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary mb-4">
              Your Order Is Confirmed
            </h1>
            <p className="text-lg text-foreground/70 mb-12">
              Thank you for your purchase. A confirmation email has been sent to your inbox.
            </p>

            {/* Order Summary Card */}
            <div className="bg-card border border-border rounded-xl p-8 mb-10 text-left">
              <h2 className="text-xl font-heading font-bold text-primary mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground/60 text-sm uppercase tracking-wide font-medium">Product</span>
                  <span className="font-semibold text-primary">{order?.productName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground/60 text-sm uppercase tracking-wide font-medium">Amount Paid</span>
                  <span className="font-bold text-primary text-lg">
                    {order ? formatCurrency(order.amountPaid, order.currency) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground/60 text-sm uppercase tracking-wide font-medium">Payment</span>
                  <span className="font-semibold text-accent">✓ Confirmed</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-foreground/60 text-sm uppercase tracking-wide font-medium">Estimated Delivery</span>
                  <span className="font-medium text-primary">5–10 business days</span>
                </div>
              </div>
            </div>

            {/* Email notification */}
            <div className="flex items-center justify-center gap-2 text-foreground/60 mb-10">
              <Mail className="h-4 w-4" />
              <p className="text-sm">A confirmation email has been sent to your email address.</p>
            </div>

            {/* CTA */}
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default OrderConfirmation;
