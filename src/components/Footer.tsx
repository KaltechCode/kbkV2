import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
const Footer = () => {
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info with Logo */}
          <div>
            <Link to="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
              <Logo variant="light" size="footer" />
            </Link>
            <p className="text-primary-foreground/80 mb-4 font-semibold">
              From Knowledge to Legacy
            </p>
            <p className="text-primary-foreground/80">
              Email: info@kbklegacyshield.com<br />
              Phone: (706) 200-2359
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <nav className="space-y-2">
              <Link to="/" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Home
              </Link>
              <Link to="/about" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                About
              </Link>
              <Link to="/founder" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Meet the Founder
              </Link>
              <Link to="/services" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Solutions
              </Link>
              <Link to="/core-values" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Core Values
              </Link>
              <Link to="/why-us" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Resources
              </Link>
              <Link to="/calculators" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Calculators
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Legal</h4>
            <nav className="space-y-2">
              <Link to="/privacy-policy" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-use" className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Terms of Use
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/80">
            KB&K Legacy Shield © 2025. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;