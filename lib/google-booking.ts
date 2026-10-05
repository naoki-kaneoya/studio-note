type BackendConfig = { url: string; secret: string };

/** Google接続の宛先・秘密値・キャッシュ方針を、予約と空き表示で共有する。 */
export function getBookingBackendConfig(): BackendConfig | null {
  const value = process.env.GOOGLE_BOOKING_SCRIPT_URL;
  const secret = process.env.GOOGLE_BOOKING_SECRET;
  if (!value || !secret) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "script.google.com" ||
      url.port || url.username || url.password || url.search || url.hash ||
      !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)) return null;
    return { url: value, secret };
  } catch {
    return null;
  }
}

export async function callBookingBackend(config: BackendConfig, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, secret: config.secret }),
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error("Booking backend unavailable");
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Invalid booking backend response");
  return result as Record<string, unknown>;
}
