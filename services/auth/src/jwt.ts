// JWT signing + verification.
//
// History: started on HS256 (shared secret). Moved to RS256 in 2026-04 as prep
// for the HubSpot OAuth2 partner app (which requires asymmetric signing), then
// dropped the HS256 verify fallback in 2026-05 once every issued token had
// rolled over. RS256-only as of now.
import { createSign, createVerify } from "crypto";

export const JWT_ALGORITHMS = ["RS256"] as const;
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

export function sign(claims: Claims): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(claims));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${body}`);
  const sig = b64url(signer.sign(process.env.JWT_PRIVATE_KEY ?? ""));
  return `${header}.${body}.${sig}`;
}

export function verify(token: string): Claims | null {
  const [header, body, sig] = token.split(".");
  if (!header || !body || !sig) return null;
  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${header}.${body}`);
  const ok = verifier.verify(
    process.env.JWT_PUBLIC_KEY ?? "",
    Buffer.from(sig.replace(/-/g, "+").replace(/_/g, "/"), "base64")
  );
  if (!ok) return null;
  return JSON.parse(Buffer.from(body, "base64").toString()) as Claims;
}
