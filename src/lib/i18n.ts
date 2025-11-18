/**
 * Internationalization utilities
 * Basic i18n support (can be extended with next-intl or similar)
 */

export type Locale = "en" | "hi" | "mr" | "ta" | "te";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Add translations here
    "welcome": "Welcome",
    "dashboard": "Dashboard",
    "tests": "Tests",
    "study_plan": "Study Plan",
    "doubt_chat": "Doubt Chat",
    "leaderboard": "Leaderboard",
  },
  hi: {
    "welcome": "स्वागत है",
    "dashboard": "डैशबोर्ड",
    "tests": "टेस्ट",
    "study_plan": "अध्ययन योजना",
    "doubt_chat": "संदेह चैट",
    "leaderboard": "लीडरबोर्ड",
  },
  mr: {},
  ta: {},
  te: {},
};

/**
 * Get translation for key
 */
export function t(key: string, locale: Locale = "en"): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-IN" : locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format number according to locale
 */
export function formatNumber(number: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-IN" : locale).format(number);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(amount: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-IN" : locale, {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

