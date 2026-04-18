// customers — Master customer + dedup.
//
// Owns the canonical customer identity in the `customers` Supabase datastore,
// publishes `customers.merged` on Kafka, and (since the HubSpot integration)
// mirrors every contact into the CRM.
import { publish } from "@marola/bus";
import { customersDb } from "@marola/db";
import { upsertContact } from "@marola/hubspot";

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
  await upsertContact({ email: c.email, country: c.country });
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
