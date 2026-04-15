// stripe client — Payments processor. Stripe Connect for multi-merchant payouts.
//
// Uses the official `stripe` Node SDK so we get typed resources, idempotency
// and automatic network retries instead of hand-rolling REST calls. The
// payments service calls in here; the SDK is the only thing that talks to
// api.stripe.com.
import Stripe from "stripe";

export const PROVIDER = "stripe";

let stripe: Stripe | null = null;

function client(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2024-06-20",
      maxNetworkRetries: 2,
    });
  }
  return stripe;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
}

export async function createPaymentIntent(
  amountCents: number,
  currency: string,
  connectedAccount: string
): Promise<PaymentIntent> {
  const intent = await client().paymentIntents.create(
    {
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
    },
    { stripeAccount: connectedAccount }
  );
  return {
    id: intent.id,
    client_secret: intent.client_secret ?? "",
    status: intent.status,
  };
}

export async function refund(intentId: string): Promise<void> {
  await client().refunds.create({ payment_intent: intentId });
}
