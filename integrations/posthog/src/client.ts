// posthog client — Product analytics.
//
// The API gateway emits a server-side event for every routed request so we can
// see channel/endpoint traffic in PostHog without trusting browser SDKs. Uses
// the official `posthog-node` SDK (batches + flushes events for us).
import { PostHog } from "posthog-node";

export const PROVIDER = "posthog";

let posthog: PostHog | null = null;

function client(): PostHog {
  if (!posthog) {
    posthog = new PostHog(process.env.POSTHOG_KEY ?? "", {
      host: "https://eu.posthog.com",
      flushAt: 20,
    });
  }
  return posthog;
}

export interface CaptureEvent {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
}

export async function capture(e: CaptureEvent): Promise<void> {
  client().capture({
    distinctId: e.distinctId,
    event: e.event,
    properties: e.properties ?? {},
  });
}
