// orders — Order ingest + normalize.
//
// First service in the platform. Accepts orders from the WooCommerce EE store
// (woo-1) and writes them to the `orders` Supabase datastore. Other concerns
// (CRM mirror, async fan-out) get layered on in later milestones.
import { ordersDb } from "@marola/db";

export const SERVICE_NAME = "orders";

export interface IncomingOrder {
  externalId: string;
  channel: "woo-1";
  email: string;
  customerId: string;
  totalCents: number;
  currency: string;
}

export async function ingest(o: IncomingOrder): Promise<string> {
  const id = `ord_${o.channel}_${o.externalId}`;
  await ordersDb.insertOrder({
    id,
    channel: o.channel,
    customer_id: o.customerId,
    total_cents: o.totalCents,
    currency: o.currency,
    status: "pending",
  });
  return id;
}

export async function markPaid(id: string): Promise<void> {
  await ordersDb.setOrderStatus(id, "paid");
}
