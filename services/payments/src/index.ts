// payments — Payment intents + reconciliation.
//
// Creates Stripe Connect payment intents (multi-merchant payouts), records them
// in the `payments` Supabase datastore, and publishes `payments.settled` on
// Kafka so orders can flip to paid. Reconciliation polls Stripe for final state.
import { publish } from "@marola/bus";
import { paymentsDb } from "@marola/db";
import { createPaymentIntent, refund } from "@marola/stripe";

export const SERVICE_NAME = "payments";

export async function authorize(
  orderId: string,
  amountCents: number,
  currency: string,
  merchantAccount: string
): Promise<string> {
  const intent = await createPaymentIntent(
    amountCents,
    currency,
    merchantAccount
  );
  await paymentsDb.recordPayment({
    id: `pay_${orderId}`,
    order_id: orderId,
    stripe_intent_id: intent.id,
    amount_cents: amountCents,
    currency,
    status: "requires_payment",
  });
  return intent.client_secret;
}

export async function settle(intentId: string, orderId: string): Promise<void> {
  await paymentsDb.reconcile(intentId, "succeeded");
  await publish({
    topic: "payments.settled",
    key: orderId,
    payload: { orderId, intentId },
  });
}

export async function refundOrder(
  intentId: string,
  orderId: string
): Promise<void> {
  await refund(intentId);
  await paymentsDb.reconcile(intentId, "refunded");
  await publish({
    topic: "payments.refunded",
    key: orderId,
    payload: { orderId, intentId },
  });
}
