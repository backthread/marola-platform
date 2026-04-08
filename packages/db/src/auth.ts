// auth data-access — reads the `auth` Supabase datastore (users + sessions).
import { db } from "./client";

export interface UserRow {
  id: string;
  email: string;
  role: "customer" | "staff" | "admin";
  password_hash: string;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { data } = await db()
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  return (data as UserRow) ?? null;
}

export async function storeRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: string
): Promise<void> {
  const { error } = await db()
    .from("refresh_tokens")
    .insert({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt });
  if (error) throw new Error(`auth.refresh_tokens.insert: ${error.message}`);
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  await db().from("refresh_tokens").delete().eq("token_hash", tokenHash);
}
