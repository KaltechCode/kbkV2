// Centralized public, non-secret config for Edge Functions.
// Keep in sync with src/config/appConfig.ts (Edge Functions cannot import from src/).
export const AppConfig = {
  BASE_URL: "https://kbk-v2.vercel.app",
  EMAIL_REPLY_TO: "test@kaltechconsultancy.tech",

  ROUTES: {
    ORDER_CONFIRMATION: "/stress-test-confirmation",
    PAYMENT_CANCELED: "/payment-cancelled",
  },

  STRIPE: {
    PAYMENT_LINK: "https://buy.stripe.com/test_bJe9AT27meYc48I2vtgIo00",
  },

  ALLOWED_ORIGINS: [
    "https://kbklegacyshield.com",
    "https://kbk-v2.vercel.app",
    // Localhost for local development
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ] as string[],
};
