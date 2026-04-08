// JWT signing + verification.
//
// Launch state: symmetric HS256 with a shared secret. Simple and fast, fine
// while everything is first-party. (We move to RS256 once we need to hand a
// public verification key to an external partner.)
import { createHmac } from "crypto";

export const JWT_ALGORITHMS = ["HS256"] as const;
export type JwtAlg = (typeof JWT_ALGORITHMS)[number];

export interface Claims {
  sub: string;
  role: string;
  exp: number;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function hmac(data: string): string {
  return b64url(
    createHmac("sha256", process.env.JWT_SECRET ?? "dev-secret")
      .update(data)
      .digest()
  );
}

export function sign(claims: Claims): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(claims));
  return `${header}.${body}.${hmac(`${header}.${body}`)}`;
}

export function verify(token: string): Claims | null {
  const [header, body, sig] = token.split(".");
  if (!header || !body || !sig) return null;
  if (hmac(`${header}.${body}`) !== sig) return null;
  return JSON.parse(Buffer.from(body, "base64").toString()) as Claims;
}
