// @marola/db/client — shared Supabase client factory.
//
// Each service imports its own data-access module from this package; they all
// share a single configured Supabase client so connection settings + the
// service-role key handling live in one place.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_SECRET_KEY ?? "",
      { auth: { persistSession: false } }
    );
  }
  return client;
}
