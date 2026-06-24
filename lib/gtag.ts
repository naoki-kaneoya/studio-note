/** GA4 イベント送信ヘルパー（クライアント側）。 */
export function trackEvent(
  action: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", action, params || {});
}
