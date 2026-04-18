// webhooks — Inbound webhook router + signature verify.
//
// Receives order-created webhooks from the WooCommerce stores (woo-1 EE, woo-2
// LV) and the Magento wholesale store, verifies the per-channel signature, then
// normalizes the payload and hands it to the orders service for ingest.
import { ingest, IncomingOrder } from "@marola/orders";
import { CHANNELS, ChannelId } from "./channels";

export const SERVICE_NAME = "webhooks";

export interface InboundHook {
  channel: ChannelId;
  signature: string;
  raw: {
    id: string | number;
    email: string;
    customer_id: string;
    total: number;
    currency: string;
  };
}

function verifySignature(channel: ChannelId, signature: string): boolean {
  const cfg = CHANNELS[channel];
  // Real impl HMACs cfg.signatureHeader; here we just require a non-empty sig.
  return Boolean(cfg) && signature.length > 0;
}

export async function route(hook: InboundHook): Promise<{ orderId: string }> {
  if (!verifySignature(hook.channel, hook.signature)) {
    throw new Error(`webhooks: bad signature for ${hook.channel}`);
  }
  const order: IncomingOrder = {
    externalId: String(hook.raw.id),
    channel: hook.channel,
    email: hook.raw.email,
    customerId: hook.raw.customer_id,
    totalCents: Math.round(hook.raw.total * 100),
    currency: hook.raw.currency,
  };
  return { orderId: await ingest(order) };
}
