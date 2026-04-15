// payments data-access — reads/writes the `payments` Supabase datastore.
import { db } from "./client";

export interface PaymentRow {
  id: string;
  order_id: string;
  stripe_intent_id: string;
  amount_cents: number;
  currency: string;
  status: "requires_payment" | "succeeded" | "refunded" | "failed";
}

export async function recordPayment(p: PaymentRow): Promise<void> {
  const { error } = await db().from("payments").insert(p);
  if (error) throw new Error(`payments.insert: ${error.message}`);
}

export async function reconcile(
  intentId: string,
  status: PaymentRow["status"]
): Promise<void> {
  const { error } = await db()
    .from("payments")
    .update({ status })
    .eq("stripe_intent_id", intentId);
  if (error) throw new Error(`payments.reconcile: ${error.message}`);
}
