#!/usr/bin/env node
// reconciler — nightly batch job (Cloud Scheduler → Cloud Run job).
//
// NOT request-triggered. Runs at 03:00 Europe/Tallinn, walks every payment that
// is still `requires_payment` older than an hour, asks Stripe for the final
// state and settles/marks-failed accordingly. Scheduled, batch, exits when done.
import { settle } from "@marola/payments";
import { db } from "@marola/db";

interface StalePayment {
  stripe_intent_id: string;
  order_id: string;
}

async function findStale(): Promise<StalePayment[]> {
  const { data } = await db()
    .from("payments")
    .select("stripe_intent_id, order_id")
    .eq("status", "requires_payment")
    .lt("created_at", new Date(Date.now() - 3_600_000).toISOString());
  return (data as StalePayment[]) ?? [];
}

async function main(): Promise<void> {
  const stale = await findStale();
  console.log(`[reconciler] ${stale.length} stale intents`);
  for (const p of stale) {
    await settle(p.stripe_intent_id, p.order_id);
  }
  console.log("[reconciler] done");
}

main().catch((err) => {
  console.error("[reconciler] failed", err);
  process.exit(1);
});
