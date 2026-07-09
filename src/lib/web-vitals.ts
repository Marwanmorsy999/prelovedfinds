/**
 * Web Vitals reporting utility.
 * Reports Core Web Vitals (LCP, INP, CLS) and other metrics
 * to the console in development and to an analytics endpoint in production.
 */

type Metric = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
};

function sendToAnalytics(metric: Metric) {
  // In production, send to analytics endpoint
  if (import.meta.env.PROD) {
    try {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.pathname,
        timestamp: Date.now(),
      });
      // Use sendBeacon for reliability — fires even when page is unloading
      navigator.sendBeacon("/api/vitals", body);
    } catch {
      // Non-critical — silently fail
    }
  }

  // In development, log to console
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`);
  }
}

function getRating(name: string, value: number): Metric["rating"] {
  // Thresholds based on Google's Core Web Vitals
  switch (name) {
    case "LCP":
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
    case "INP":
      return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
    case "CLS":
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
    case "FCP":
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
    case "TTFB":
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor";
    default:
      return "good";
  }
}

/**
 * Reports all available web vitals.
 * Uses PerformanceObserver API to capture metrics as they become available.
 */
export function reportWebVitals() {
  if (typeof window === "undefined" || !window.PerformanceObserver) return;

  // Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        sendToAnalytics({
          name: "LCP",
          value: lastEntry.startTime,
          rating: getRating("LCP", lastEntry.startTime),
        });
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // Observer not supported
  }

  // First Input Delay (will be replaced by INP in Chrome)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as PerformanceEventTiming | undefined;
      if (firstEntry) {
        sendToAnalytics({
          name: "FID",
          value: firstEntry.processingStart - firstEntry.startTime,
          rating: getRating("FID", firstEntry.processingStart - firstEntry.startTime),
        });
      }
    });
    fidObserver.observe({ type: "first-input", buffered: true });
  } catch {
    // Observer not supported
  }

  // Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shiftEntry = entry as unknown as { hadRecentInput: boolean; value: number };
        if (!shiftEntry.hadRecentInput) {
          clsValue += shiftEntry.value;
        }
      }
      sendToAnalytics({
        name: "CLS",
        value: clsValue,
        rating: getRating("CLS", clsValue),
      });
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch {
    // Observer not supported
  }

  // First Contentful Paint
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      if (firstEntry) {
        sendToAnalytics({
          name: "FCP",
          value: firstEntry.startTime,
          rating: getRating("FCP", firstEntry.startTime),
        });
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch {
    // Observer not supported
  }

  // Navigation Timing (TTFB)
  try {
    const navObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const navEntry = entries[0] as PerformanceNavigationTiming | undefined;
      if (navEntry) {
        sendToAnalytics({
          name: "TTFB",
          value: navEntry.responseStart - navEntry.requestStart,
          rating: getRating("TTFB", navEntry.responseStart - navEntry.requestStart),
        });
      }
    });
    navObserver.observe({ type: "navigation", buffered: true });
  } catch {
    // Observer not supported
  }
}