import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import ChatWidget from "./components/ChatWidget";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Services from "./pages/Services";
import Calculators from "./pages/Calculators";
import WhyUs from "./pages/WhyUs";
import Contact from "./pages/Contact";
import Founder from "./pages/Founder";
import CoreValues from "./pages/CoreValues";
import NotFound from "./pages/NotFound";
import AdminLeads from "./pages/AdminLeads";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import BookingConfirmed from "./pages/BookingConfirmed";
import StressTest from "./pages/StressTest";
import StressTestConfirmation from "./pages/StressTestConfirmation";
import StressTestDiagnostic from "./pages/StressTestDiagnostic";
import StressTestDiagnosticForm from "./pages/StressTestDiagnosticForm";
import DetailedDiagnostic from "./pages/DetailedDiagnostic";
import StressTestResume from "./pages/StressTestResume";
import DiagnosticConfirmation from "./pages/DiagnosticConfirmation";
import OrderConfirmation from "./pages/OrderConfirmation";
import PaymentCancelled from "./pages/PaymentCancelled";
import Metric from "./pages/Metric";

const queryClient = new QueryClient();

// Wrapper component that normalizes any /booking-confirmed/* variant to /booking-confirmed
const BookingConfirmedRoute = () => {
  const location = useLocation();

  // If exactly "/booking-confirmed", render the page
  if (location.pathname === "/booking-confirmed") {
    return <BookingConfirmed />;
  }

  // Otherwise redirect to canonical URL, preserving query params
  return <Navigate replace to={"/booking-confirmed" + location.search} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <ChatWidget />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/founder" element={<Founder />} />
            <Route path="/services" element={<Services />} />
            <Route path="/core-values" element={<CoreValues />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/why-us" element={<WhyUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route
              path="/financial-stability-stress-test"
              element={<StressTest />}
            />
            <Route
              path="/stress-test/confirmation"
              element={<StressTestConfirmation />}
            />
            <Route
              path="/stress-test/diagnostic"
              element={<StressTestDiagnostic />}
            />
            <Route
              path="/stress-test/diagnostic/form"
              element={<StressTestDiagnosticForm />}
            />
            <Route
              path="/detailed-diagnostic"
              element={<DetailedDiagnostic />}
            />
            <Route
              path="/diagnostic-confirmation"
              element={<DiagnosticConfirmation />}
            />
            <Route path="/stress-test/resume" element={<StressTestResume />} />

            <Route
              path="/stress-test-confirmation"
              element={<StressTestConfirmation />}
            />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route
              path="/booking-confirmed/*"
              element={<BookingConfirmedRoute />}
            />
            <Route path="/visualization*" element={<Metric />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
