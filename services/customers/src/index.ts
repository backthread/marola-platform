// customers — Master customer + dedup.
//
// Owns the canonical customer identity across all channels in the `customers`
// Supabase datastore. At this stage it just upserts + finds duplicates locally;
// async merge events and the CRM/accounting exports come later.
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

export async function dedupe(email: string): Promise<number> {
  const dupes = await customersDb.findDuplicates(email);
  return dupes.length;
}
