// stripe client — Payments processor. Stripe Connect for multi-merchant payouts.
//
// We talk to the Stripe REST API directly (no SDK) so the only dependency is
// fetch; this keeps the payments service cold-start cheap on Cloud Run.
export const PROVIDER = "stripe";

const BASE = "https://api.stripe.com/v1";

function authHeader(): string {
  return `Bearer ${process.env.STRIPE_SECRET_KEY ?? ""}`;
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
  const body = new URLSearchParams({
    amount: String(amountCents),
    currency,
    "automatic_payment_methods[enabled]": "true",
  });
  const res = await fetch(`${BASE}/payment_intents`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Stripe-Account": connectedAccount,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) throw new Error(`stripe: ${res.status}`);
  return (await res.json()) as PaymentIntent;
}

export async function refund(intentId: string): Promise<void> {
  const res = await fetch(`${BASE}/refunds`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ payment_intent: intentId }),
  });
  if (!res.ok) throw new Error(`stripe refund: ${res.status}`);
}
