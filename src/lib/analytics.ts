/**
 * Analytics tracking utilities
 * Tracks user events and feature usage
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

/**
 * Track event (client-side)
 */
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") {
    return;
  }

  // Send to analytics endpoint
  fetch("/api/analytics/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event,
      properties,
      timestamp: new Date().toISOString(),
    }),
  }).catch((error) => {
    console.error("Analytics tracking error:", error);
  });
}

/**
 * Track page view
 */
export function trackPageView(path: string) {
  trackEvent("page_view", { path });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(feature: string, metadata?: Record<string, any>) {
  trackEvent("feature_used", {
    feature,
    ...metadata,
  });
}

/**
 * Track conversion event
 */
export function trackConversion(type: string, value?: number) {
  trackEvent("conversion", {
    type,
    value,
  });
}

/**
 * Track error
 */
export function trackError(error: Error, context?: Record<string, any>) {
  trackEvent("error", {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

