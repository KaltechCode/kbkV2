import { useEffect } from "react";

/**
 * Custom hook to dynamically set page titles for SEO
 * Format: "Page Name | KB&K Legacy Shield"
 * @param title - The specific page title (e.g., "About Us", "Contact")
 */
export const usePageTitle = (title?: string) => {
  useEffect(() => {
    const baseTitle = "KB&K Legacy Shield";
    const fullTitle = title ? `${title} | ${baseTitle}` : "KB&K Legacy Shield | Generational Wealth & Family Legacy Planning";
    
    document.title = fullTitle;
    
    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = "KB&K Legacy Shield | Generational Wealth & Family Legacy Planning";
    };
  }, [title]);
};
