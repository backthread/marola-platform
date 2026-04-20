#!/usr/bin/env node
// dedup-sweeper — weekly customer dedup batch job.
//
// NOT request-triggered. Cron-scheduled (Sundays 04:00). Scans the customers
// table for colliding emails across channels and asks the customers service to
// merge them, which emits customers.merged on Kafka. Batch, then exits.
import { dedupe } from "@marola/customers";
import { db } from "@marola/db";

async function collidingEmails(): Promise<string[]> {
  const { data } = await db().rpc("emails_with_duplicates");
  return ((data as { email: string }[]) ?? []).map((r) => r.email);
}

async function main(): Promise<void> {
  const emails = await collidingEmails();
  console.log(`[dedup] ${emails.length} colliding emails`);
  for (const email of emails) {
    await dedupe(email);
  }
  console.log("[dedup] done");
}

main().catch((err) => {
  console.error("[dedup] failed", err);
  process.exit(1);
});
