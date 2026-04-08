// customers data-access — reads/writes the `customers` Supabase datastore.
import { db } from "./client";

export interface CustomerRow {
  id: string;
  email: string;
  full_name: string;
  country: string;
  merged_into: string | null;
}

export async function upsertCustomer(c: CustomerRow): Promise<void> {
  const { error } = await db()
    .from("customers")
    .upsert(c, { onConflict: "email" });
  if (error) throw new Error(`customers.upsert: ${error.message}`);
}

export async function findDuplicates(email: string): Promise<CustomerRow[]> {
  const { data } = await db().from("customers").select("*").eq("email", email);
  return (data as CustomerRow[]) ?? [];
}
