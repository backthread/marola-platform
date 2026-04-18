// orders — Order ingest + normalize.
//
// Accepts orders from every sales channel (woo-1, woo-2, magento, pos-fleet),
// writes them to the `orders` Supabase datastore, mirrors the deal into HubSpot
// and publishes `orders.created` on Kafka for inventory + payments to react to.
import { publish } from "@marola/bus";
import { ordersDb } from "@marola/db";
import { upsertContact, recordDeal } from "@marola/hubspot";

export const SERVICE_NAME = "orders";

export interface IncomingOrder {
  externalId: string;
  channel: "woo-1" | "woo-2" | "magento" | "pos-fleet";
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

  // Mirror the sale into the CRM so sales sees channel revenue.
  const contactId = await upsertContact({ email: o.email });
  await recordDeal(contactId, o.totalCents / 100, "checkout_completed");

  // Tell the rest of the platform an order exists.
  await publish({
    topic: "orders.created",
    key: id,
    payload: { orderId: id, channel: o.channel, totalCents: o.totalCents },
  });

  return id;
}

export async function markPaid(id: string): Promise<void> {
  await ordersDb.setOrderStatus(id, "paid");
  await publish({ topic: "orders.paid", key: id, payload: { orderId: id } });
}
