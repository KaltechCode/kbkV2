import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Logo from "@/components/Logo";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const location = useLocation();

  const primaryNav = [
    { name: "Home", href: "/" },
    { name: "Solutions", href: "/services" },
    { name: "Stress Test", href: "/financial-stability-stress-test" },
  ];

  const secondaryNav = [
    { name: "About", href: "/about" },
    { name: "Meet the Founder", href: "/founder" },
    { name: "Core Values", href: "/core-values" },
    { name: "Resources", href: "/why-us" },
    { name: "Calculators", href: "/calculators" },
    { name: "Contact", href: "/contact" },
  ];

  const allNav = [...primaryNav, ...secondaryNav];

  const isActive = (path: string) => location.pathname === path;
  
  const isBookingConfirmationPage = location.pathname.toLowerCase().startsWith("/booking-confirmed");

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b shadow-nav">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 md:h-24 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <Logo variant="dark" size="header" />
            </Link>
          </div>

          {/* Desktop Primary Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {primaryNav.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  isActive(item.href) ? "text-accent" : "text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA + Hamburger */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {!isBookingConfirmationPage && (
              <Button asChild variant="outline" className="border-2 border-navy-primary text-navy-primary hover:bg-navy-primary hover:text-white shadow-button">
                <a href="https://tidycal.com/kingsley-ekinde/30-minute-meeting-1vr60yy" target="_blank" rel="noopener noreferrer">
                  Schedule Your Clarity Call
                </a>
              </Button>
            )}
            {/* Desktop Hamburger for secondary nav */}
            <Sheet open={isHamburgerOpen} onOpenChange={setIsHamburgerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More pages">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {secondaryNav.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block px-2 py-1 text-lg font-medium transition-colors hover:text-accent ${
                        isActive(item.href) ? "text-accent" : "text-foreground"
                      }`}
                      onClick={() => setIsHamburgerOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                {allNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-2 py-1 text-lg font-medium transition-colors hover:text-accent ${
                      isActive(item.href) ? "text-accent" : "text-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {!isBookingConfirmationPage && (
                  <Button asChild variant="outline" className="mt-4 border-2 border-navy-primary text-navy-primary hover:bg-navy-primary hover:text-white">
                    <a href="https://tidycal.com/kingsley-ekinde/30-minute-meeting-1vr60yy" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
                      Schedule Your Clarity Call
                    </a>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;