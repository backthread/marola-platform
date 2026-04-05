// orders data-access — reads/writes the `orders` Supabase datastore.
import { db } from "./client";

export interface OrderRow {
  id: string;
  channel: string;
  customer_id: string;
  total_cents: number;
  currency: string;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
}

export async function insertOrder(order: OrderRow): Promise<void> {
  const { error } = await db().from("orders").insert(order);
  if (error) throw new Error(`orders.insert: ${error.message}`);
}

export async function setOrderStatus(
  id: string,
  status: OrderRow["status"]
): Promise<void> {
  const { error } = await db()
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(`orders.update: ${error.message}`);
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  const { data } = await db().from("orders").select("*").eq("id", id).single();
  return (data as OrderRow) ?? null;
}
