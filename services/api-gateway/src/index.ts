// api-gateway — Auth + rate-limit + routing.
//
// Verifies the JWT via the auth service, then dispatches into orders +
// inventory. Payments + analytics get wired in as those pieces land.
import { verifyToken } from "@marola/auth";
import { ingest, IncomingOrder } from "@marola/orders";
import { setOnHand } from "@marola/inventory";

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
    default:
      return { status: 404 };
  }
}
