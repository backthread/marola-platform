// posthog client — Product analytics.
//
// The API gateway emits a server-side event for every routed request so we can
// see channel/endpoint traffic in PostHog without trusting browser SDKs.
export const PROVIDER = "posthog";

const BASE = "https://eu.posthog.com";

export interface CaptureEvent {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
}

export async function capture(e: CaptureEvent): Promise<void> {
  const res = await fetch(`${BASE}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.POSTHOG_KEY ?? "",
      event: e.event,
      distinct_id: e.distinctId,
      properties: e.properties ?? {},
      timestamp: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`posthog: ${res.status}`);
}
