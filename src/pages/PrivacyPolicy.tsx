import { usePageTitle } from "@/hooks/usePageTitle";
import AnimatedSection from "@/components/AnimatedSection";

const PrivacyPolicy = () => {
  usePageTitle("Privacy Policy");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection variant="fade-up">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
              Privacy Policy
            </h1>
            <p className="text-center text-primary-foreground/80 text-lg">
              KB&K Legacy Shield
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <AnimatedSection variant="fade-up">
            <div className="prose prose-lg max-w-none text-foreground">
              <p className="text-muted-foreground mb-8">
                <strong>Effective Date:</strong> May 2026
              </p>

              <p className="mb-8">
                Thank you for visiting KB&K Legacy Shield ("KB&K Legacy Shield," "we," "us," "our").
                This Privacy Policy explains how we collect, use, disclose, and protect your information
                when you visit our website{" "}
                <a href="https://www.kbklegacyshield.com" className="text-accent hover:underline">
                  www.kbklegacyshield.com
                </a>{" "}
                ("Website") and use our services, including our financial calculators and the Financial
                Stability Score assessment. By using this Website, you agree to the practices described below.
              </p>

              {/* Section 1 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                1. Information We Collect
              </h2>
              <p className="mb-4">
                Because we value transparency, here is exactly what we collect—and what we do not:
              </p>

              <h3 className="font-heading text-xl font-semibold text-primary mt-6 mb-3">
                A. Personal Information You Voluntarily Provide
              </h3>
              <p className="mb-4">
                We collect personal information only when you intentionally submit it through
                lead-capture forms, calculators, the Financial Stability Score assessment, or contact
                forms on the Website. This may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Marital status and number of children</li>
                <li>
                  Self-reported financial estimates (e.g., approximate household income, monthly
                  expenses, mortgage balance, consumer debt, and current life insurance coverage)
                </li>
                <li>Any other information you choose to share in messages or form fields</li>
              </ul>

              <h3 className="font-heading text-xl font-semibold text-primary mt-6 mb-3">
                B. Payment Information
              </h3>
              <p className="mb-4">
                If you choose to purchase our paid services, such as the Full Financial Diagnostic,
                your payment will be processed by a secure third-party payment processor. We do not
                collect, store, or have access to your full credit card numbers or bank account
                details. We only receive confirmation of payment and basic transaction details
                necessary to fulfill your order.
              </p>

              <h3 className="font-heading text-xl font-semibold text-primary mt-6 mb-3">
                C. Information We Do Not Collect
              </h3>
              <p className="mb-4">We do not collect:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Analytics data (we do not use Google Analytics or similar tools)</li>
                <li>Login credentials (our Website does not currently require user accounts)</li>
                <li>Highly sensitive personal information (such as Social Security Numbers)</li>
              </ul>

              <h3 className="font-heading text-xl font-semibold text-primary mt-6 mb-3">
                D. Automatically Collected Technical Data
              </h3>
              <p className="mb-4">
                Like most websites, our hosting provider may automatically log standard technical
                information such as IP address, device type, browser type, and timestamp. We do not
                personally analyze or use this data beyond what is necessary to maintain Website
                functionality and security.
              </p>

              {/* Section 2 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="mb-4">We use the information you provide for purposes such as:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Generating and delivering your Financial Stability Score, gap reports, and action plans.</li>
                <li>Providing personalized results from our FIN and DIME calculators.</li>
                <li>Responding to inquiries and scheduling Clarity Calls.</li>
                <li>Delivering requested resources, purchased diagnostic reports, or educational information.</li>
                <li>Providing updates or communication if you opt into them.</li>
                <li>Improving user experience and ensuring the Website functions properly.</li>
              </ul>
              <p className="mb-4">
                We do not use your data for automated profiling, advertising, or behavioral tracking.
              </p>

              {/* Section 3 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                3. How We Share Your Information
              </h2>
              <p className="mb-4 font-semibold">
                We do not sell, rent, or trade your personal information—ever.
              </p>
              <p className="mb-4">
                We may share basic data only with trusted service providers who support Website
                operations, payment processing, or email delivery (for example, a form submission,
                payment gateway, or email service). These providers are permitted to use information
                solely to perform services on our behalf and must protect it in accordance with
                applicable privacy laws.
              </p>
              <p className="mb-4">
                We do not share information with advertisers, data brokers, or analytics platforms.
              </p>

              {/* Section 4 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                4. Cookies and Tracking Technologies
              </h2>
              <p className="mb-4">
                We do not use cookies for analytics, advertising, or tracking. If our hosting platform
                or payment processor uses essential cookies for security, payment verification, or
                basic functionality, those cookies will not collect personal information for marketing
                purposes.
              </p>

              {/* Section 5 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                5. Data Security
              </h2>
              <p className="mb-4">
                We implement reasonable administrative and technical safeguards to protect your
                information—including the financial estimates you provide—from unauthorized access,
                alteration, or disclosure. While no website is completely immune from risks, we take
                your privacy seriously and work to ensure your data remains secure.
              </p>

              {/* Section 6 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                6. Your Rights
              </h2>
              <p className="mb-4">You may request at any time to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Access the information we have about you.</li>
                <li>Correct inaccurate information.</li>
                <li>Request that your information be deleted.</li>
                <li>Withdraw consent for future communication.</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, email us at{" "}
                <a href="mailto:info@kbklegacyshield.com" className="text-accent hover:underline">
                  info@kbklegacyshield.com
                </a>
                . We will respond within a reasonable timeframe.
              </p>

              {/* Section 7 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                7. Children's Privacy
              </h2>
              <p className="mb-4">
                Our Website is not intended for individuals under the age of 18. We do not knowingly
                collect or store information from anyone under 18. If we become aware of such data,
                we will delete it promptly.
              </p>

              {/* Section 8 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                8. Changes to This Policy
              </h2>
              <p className="mb-4">
                We may update this Privacy Policy occasionally to reflect changes in our services or
                legal requirements. The effective date at the top will reflect the most recent
                version. Continued use of the Website after any update constitutes acceptance of the
                revised policy.
              </p>

              {/* Section 9 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                9. Contact Information
              </h2>
              <p className="mb-4">
                For questions, concerns, or privacy requests, contact us at:
              </p>
              <p className="mb-2 whitespace-pre-line">
                <strong>Email:</strong> <a href="mailto:info@kbklegacyshield.com" className="text-accent hover:underline">info@kbklegacyshield.com</a>{"\n"}
                <strong>Phone:</strong> (706) 200-2359
              </p>
              <p className="mb-8">
                <strong>Website:</strong>{" "}
                <a href="https://www.kbklegacyshield.com" className="text-accent hover:underline">
                  www.kbklegacyshield.com
                </a>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;