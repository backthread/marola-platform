// api-gateway — Auth + rate-limit + routing.
//
// Verifies the JWT via auth, then dispatches into orders, inventory and (since
// the Stripe launch) payments. Server-side analytics land in a later milestone.
import { verifyToken } from "@marola/auth";
import { ingest, IncomingOrder } from "@marola/orders";
import { setOnHand } from "@marola/inventory";
import { authorize } from "@marola/payments";

export const SERVICE_NAME = "api-gateway";

export interface GatewayRequest {
  path: string;
  token: string;
  body: unknown;
}

export async function handle(req: GatewayRequest): Promise<unknown> {
  const claims = verifyToken(req.token);
  if (!claims) return { status: 401 };

  switch (req.path) {
    case "/orders":
      return { id: await ingest(req.body as IncomingOrder) };
    case "/inventory/set": {
      const b = req.body as { sku: string; onHand: number };
      await setOnHand(b.sku, b.onHand);
      return { status: 202 };
    }
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
