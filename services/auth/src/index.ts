// auth — issues + verifies JWTs.
//
// Reads the `auth` Supabase datastore (users). Other services never touch the
// user table directly — they call verifyToken() here. Refresh-token rotation is
// added in a later milestone.
import { authDb } from "@marola/db";
import { sign, verify, Claims } from "./jwt";

export const SERVICE_NAME = "auth";

export interface LoginResult {
  accessToken: string;
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
  return { accessToken: sign(claims), role: user.role };
}

/** Used by api-gateway + backoffice-be to authorize requests. */
export function verifyToken(token: string): Claims | null {
  return verify(token);
}
