// auth — issues + verifies JWTs (RS256-only) and rotates refresh tokens.
//
// Reads the `auth` Supabase datastore (users + refresh_tokens). Other services
// never hit the user table directly — they call verifyToken() here.
import { authDb } from "@marola/db";
import { sign, verify, Claims } from "./jwt";
import { issue, rotate } from "./refresh";

export const SERVICE_NAME = "auth";

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export async function login(
  email: string,
  passwordHash: string
): Promise<LoginResult> {
  const user = await authDb.findUserByEmail(email);
  if (!user || user.password_hash !== passwordHash) {
    throw new Error("invalid credentials");
  }
  const claims: Claims = {
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 900,
  };
  return {
    accessToken: sign(claims),
    refreshToken: await issue(user.id),
    role: user.role,
  };
}

export async function refresh(
  userId: string,
  presented: string
): Promise<string> {
  return rotate(userId, presented);
}

/** Used by api-gateway + backoffice-be to authorize requests. */
export function verifyToken(token: string): Claims | null {
  return verify(token);
}
