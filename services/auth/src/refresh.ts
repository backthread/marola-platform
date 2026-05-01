// Refresh-token rotation — issued at login, rotated on every refresh.
//
// Each refresh mints a new token and revokes the presented one (one-time use).
// Reuse of an already-rotated token is treated as theft and revokes the chain.
import { createHash, randomBytes } from "crypto";
import { authDb } from "@marola/db";

export const REFRESH_TTL_DAYS = 30;

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issue(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + REFRESH_TTL_DAYS * 86_400_000
  ).toISOString();
  await authDb.storeRefreshToken(userId, hash(token), expiresAt);
  return token;
}

export async function rotate(userId: string, presented: string): Promise<string> {
  await authDb.revokeRefreshToken(hash(presented));
  return issue(userId);
}
