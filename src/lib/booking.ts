// Centralized booking configuration to ensure consistency across all CTAs
export const BOOKING_URL = "https://tidycal.com/kingsley-ekinde/30-minute-meeting-1vr60yy";

/**
 * Opens the booking URL in a new tab (standard site behavior)
 */
export const openBookingLink = () => {
  window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
};
