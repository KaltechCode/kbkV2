// Centralized public, non-secret app configuration.
// Mirror any cross-runtime values in supabase/functions/_shared/appConfig.ts
// (Edge Functions cannot import from src/).
export const AppConfig = {
  BASE_URL: "https://kbklegacyshield.com",
  EMAIL_REPLY_TO: "info@kbklegacyshield.com",

  ROUTES: {
    ORDER_CONFIRMATION: "/stress-test-confirmation",
    PAYMENT_CANCELED: "/payment-cancelled",
  },

  STRIPE: {
    // PAYMENT_LINK: "https://buy.stripe.com/6oU5kF2Xb8FAd0QfWj2Ji00",
    PAYMENT_LINK: "https://buy.stripe.com/test_bJe9AT27meYc48I2vtgIo00",
  },

  ALLOWED_ORIGINS: [
    "https://kbklegacyshield.com",
    "https://www.kbklegacyshield.com",
    // Localhost for local development
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ] as string[],
};
