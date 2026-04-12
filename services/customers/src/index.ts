// customers — Master customer + dedup.
//
// Owns the canonical customer identity in the `customers` Supabase datastore.
// Since the Kafka migration, a merge publishes `customers.merged` on the bus so
// orders/payments can re-point at the surviving id asynchronously.
import { publish } from "@marola/bus";
import { customersDb } from "@marola/db";

export const SERVICE_NAME = "customers";

export interface InboundCustomer {
  email: string;
  fullName: string;
  country: string;
}

export async function upsert(c: InboundCustomer): Promise<string> {
  const id = `cus_${Buffer.from(c.email).toString("hex").slice(0, 12)}`;
  await customersDb.upsertCustomer({
    id,
    email: c.email,
    full_name: c.fullName,
    country: c.country,
    merged_into: null,
  });
  return id;
}

export async function dedupe(email: string): Promise<void> {
  const dupes = await customersDb.findDuplicates(email);
  if (dupes.length < 2) return;
  const [survivor, ...rest] = dupes;
  for (const d of rest) {
    await publish({
      topic: "customers.merged",
      key: d.id,
      payload: { from: d.id, into: survivor.id },
    });
  }
}
