import { usePageTitle } from "@/hooks/usePageTitle";
import AnimatedSection from "@/components/AnimatedSection";

const TermsOfUse = () => {
  usePageTitle("Terms of Use");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection variant="fade-up">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
              Terms of Use
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
                By accessing or using{" "}
                <a href="https://www.kbklegacyshield.com" className="text-accent hover:underline">
                  www.kbklegacyshield.com
                </a>{" "}
                ("Website"), you agree to these Terms of Use ("Terms"). If you do not agree, please
                discontinue use of the Website.
              </p>

              {/* Section 1 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                1. Purpose of the Website
              </h2>
              <p className="mb-4">
                KB&K Legacy Shield provides educational content, tools, calculators, and resources
                focused on financial literacy, wealth building, insurance awareness, and legacy
                planning. This Website is for informational and educational purposes only.
              </p>
              <p className="mb-4">
                All content, including results from the Financial Stability Score, DIME Calculator,
                FIN Calculator, and the Full Financial Diagnostic, is general educational material
                and does not constitute individualized financial, legal, investment, or tax advice.
              </p>

              {/* Section 2 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                2. Eligibility
              </h2>
              <p className="mb-4">
                This Website is intended for users who are 18 years of age or older. By using the
                Website, you affirm that you meet this requirement.
              </p>

              {/* Section 3 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                3. Products and Services
              </h2>
              <p className="mb-4">
                The Website offers both free tools (such as the Financial Stability Score) and paid
                services (such as the Full Financial Diagnostic).
              </p>
              <p className="mb-4">When you purchase a paid service or diagnostic report:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You agree to provide accurate and complete information.</li>
                <li>
                  You understand that the resulting diagnostic and action plan are based solely on
                  the information you provide and are designed to highlight potential financial gaps
                  and educational strategies.
                </li>
                <li>
                  The diagnostic report is not a substitute for comprehensive financial planning with
                  a licensed professional who has reviewed your complete financial profile.
                </li>
              </ul>

              {/* Section 4 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                4. Payments and Refunds
              </h2>
              <p className="mb-4">
                If you choose to purchase the Full Financial Diagnostic or any other paid service
                offered on the Website, you agree to pay the specified fees.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  <strong>Payments:</strong> All payments are processed securely through our
                  third-party payment processors. KB&K Legacy Shield does not store your full credit
                  card information.
                </li>
                <li>
                  <strong>Refunds:</strong> Due to the digital and immediate nature of our diagnostic
                  reports and action plans, all sales are final and non-refundable unless otherwise
                  explicitly stated at the time of purchase.
                </li>
              </ul>

              {/* Section 5 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                5. Intellectual Property Rights
              </h2>
              <p className="mb-4">
                All content on the Website—including text, graphics, logos, images, videos, design
                elements, proprietary calculators, scoring algorithms, and downloadable resources—is
                the property of KB&K Legacy Shield or its content creators.
              </p>
              <p className="mb-4">
                You may not copy, reproduce, republish, distribute, or modify any content without
                our prior written permission, except for personal, non-commercial use.
              </p>

              {/* Section 6 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                6. Acceptable Use
              </h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Use the Website for unlawful purposes.</li>
                <li>Attempt to disrupt or interfere with Website functionality.</li>
                <li>
                  Copy, scrape, or reverse-engineer Website content, calculators, or diagnostic
                  algorithms without permission.
                </li>
                <li>Submit false or misleading information through any forms or calculators.</li>
                <li>
                  Attempt to hack, modify, or gain unauthorized access to portions of the Website.
                </li>
              </ul>
              <p className="mb-4">
                Any misuse may result in immediate termination of access or legal action.
              </p>

              {/* Section 7 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                7. Lead Capture and User Submissions
              </h2>
              <p className="mb-4">
                When you submit information through forms, calculators, or the Financial Stability
                Score intake on the Website, you agree that:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The information you provide is accurate to the best of your knowledge.</li>
                <li>
                  We may contact you via email or phone based on the information submitted to provide
                  your results, action plans, and relevant next steps.
                </li>
                <li>
                  You are not submitting protected or highly sensitive data (such as Social Security
                  Numbers or bank account numbers) through unencrypted forms.
                </li>
              </ul>
              <p className="mb-4">
                We reserve the right to decline or discontinue communication at our discretion.
              </p>

              {/* Section 8 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                8. Disclaimer of Warranties
              </h2>
              <p className="mb-4">
                The Website and its content are provided "as is" and "as available." We make no
                warranties, express or implied, regarding:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  The accuracy, completeness, or reliability of information, calculator results, or
                  diagnostic scores.
                </li>
                <li>The Website's availability, security, or error-free performance.</li>
                <li>
                  The suitability of the content, tools, or paid reports for your specific personal
                  financial decisions.
                </li>
              </ul>
              <p className="mb-4">All use of the Website and its tools is at your own risk.</p>

              {/* Section 9 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                9. Limitation of Liability
              </h2>
              <p className="mb-4">
                To the fullest extent permitted by law, KB&K Legacy Shield shall not be liable for
                any damages arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Your use or inability to use the Website, calculators, or diagnostic tools.</li>
                <li>
                  Your reliance on information, scores, or action plans provided on the Website.
                </li>
                <li>Errors, omissions, interruptions, or technical issues.</li>
                <li>
                  Any financial or life decisions you take based on Website content or diagnostic
                  reports.
                </li>
              </ul>
              <p className="mb-4">
                This includes direct, indirect, incidental, consequential, and punitive damages.
              </p>

              {/* Section 10 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                10. Third-Party Links
              </h2>
              <p className="mb-4">
                The Website may contain links to third-party websites. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Their content or accuracy.</li>
                <li>Their privacy practices.</li>
                <li>Their products or offerings.</li>
              </ul>
              <p className="mb-4">Use third-party links at your own discretion.</p>

              {/* Section 11 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                11. Modifications to Terms
              </h2>
              <p className="mb-4">
                We may update these Terms periodically to reflect changes in our services, such as
                new tools or paid offerings. The effective date at the top will reflect the newest
                version. Continued use of the Website constitutes acceptance of the updated Terms.
              </p>

              {/* Section 12 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                12. Governing Law
              </h2>
              <p className="mb-4">
                These Terms are governed by the laws of the State of Georgia, without regard to
                conflict-of-law rules. Any disputes arising under these Terms may be resolved in the
                appropriate courts within Georgia.
              </p>

              {/* Section 13 */}
              <h2 className="font-heading text-2xl font-bold text-primary mt-10 mb-4">
                13. Contact Information
              </h2>
              <p className="mb-4">For questions or concerns about these Terms, contact us at:</p>
              <p className="mb-8 whitespace-pre-line">
                <strong>Email:</strong> <a href="mailto:info@kbklegacyshield.com" className="text-accent hover:underline">info@kbklegacyshield.com</a>{"\n"}
                <strong>Phone:</strong> (706) 200-2359
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default TermsOfUse;