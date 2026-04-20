// api-gateway — Auth + rate-limit + routing.
//
// The single public ingress for the storefronts + POS fleet. Verifies the JWT
// via auth, then dispatches into the orders / inventory / payments services.
// Every routed request is captured into PostHog for traffic analytics.
import { verifyToken } from "@marola/auth";
import { ingest, IncomingOrder } from "@marola/orders";
import { sync as syncStock } from "@marola/inventory";
import { authorize } from "@marola/payments";
import { capture } from "@marola/posthog";

export const SERVICE_NAME = "api-gateway";

export interface GatewayRequest {
  path: string;
  token: string;
  body: unknown;
}

export async function handle(req: GatewayRequest): Promise<unknown> {
  const claims = verifyToken(req.token);
  if (!claims) return { status: 401 };

  await capture({
    event: "gateway.request",
    distinctId: claims.sub,
    properties: { path: req.path, role: claims.role },
  });

  switch (req.path) {
    case "/orders":
      return { id: await ingest(req.body as IncomingOrder) };
    case "/inventory/sync":
      await syncStock((req.body as { skus: string[] }).skus);
      return { status: 202 };
    case "/payments/authorize": {
      const b = req.body as {
        orderId: string;
        amount: number;
        currency: string;
        merchant: string;
      };
      return {
        clientSecret: await authorize(b.orderId, b.amount, b.currency, b.merchant),
      };
    }
    default:
      return { status: 404 };
  }
}
