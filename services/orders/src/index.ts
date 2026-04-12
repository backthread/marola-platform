// orders — Order ingest + normalize.
//
// Writes the `orders` Supabase datastore and, since the Kafka migration,
// publishes `orders.created` / `orders.paid` on the bus so inventory + payments
// react asynchronously instead of orders calling them directly.
import { publish } from "@marola/bus";
import { ordersDb } from "@marola/db";

export const SERVICE_NAME = "orders";

export interface IncomingOrder {
  externalId: string;
  channel: "woo-1" | "woo-2";
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
