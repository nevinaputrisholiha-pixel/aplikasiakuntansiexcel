declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fire a GA4 event; no-op when gtag is absent (ID not configured, blocked, or SSR). */
export function trackEvent(name: string, params: Record<string, string | number> = {}): void {
  const g = typeof window === "undefined" ? undefined : window.gtag;
  if (typeof g !== "function") return;
  g("event", name, params);
}
