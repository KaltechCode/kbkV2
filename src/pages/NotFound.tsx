import { useLocation, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  usePageTitle("Page Not Found");
  const location = useLocation();

  // Failsafe: redirect any booking-confirmed variant to the canonical URL
  if (location.pathname.toLowerCase().startsWith("/booking-confirmed")) {
    return <Navigate replace to={"/booking-confirmed" + location.search} />;
  }

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-accent/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl font-heading font-bold text-accent">404</span>
        </div>
        <h1 className="text-4xl font-heading font-bold mb-4 text-primary">Page Not Found</h1>
        <p className="text-xl mb-8 text-foreground/80">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="space-y-4">
          <Button 
            asChild 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-button"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          <div>
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="text-foreground/60 hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
