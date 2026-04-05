// api-gateway — routing (auth + rate-limit land in a later milestone).
//
// The single public ingress. For now it just dispatches order creation into the
// orders service; token verification and the other services are wired up as
// they come online.
import { ingest, IncomingOrder } from "@marola/orders";

export const SERVICE_NAME = "api-gateway";

export interface GatewayRequest {
  path: string;
  body: unknown;
}

export async function handle(req: GatewayRequest): Promise<unknown> {
  switch (req.path) {
    case "/orders":
      return { id: await ingest(req.body as IncomingOrder) };
    default:
      return { status: 404 };
  }
}
