// JWT signing + verification.
//
// Migrated signing to RS256 (asymmetric) as prep for the HubSpot OAuth2 partner
// app, which needs a public verification key. We KEEP an HS256 verify fallback
// for two weeks so tokens issued before the cutover still validate while they
// age out. New tokens are RS256-only.
import { createSign, createVerify, createHmac } from "crypto";

export const JWT_ALGORITHMS = ["RS256", "HS256"] as const;
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

function verifyHs256(signingInput: string, sig: string): boolean {
  const expected = b64url(
    createHmac("sha256", process.env.JWT_SECRET ?? "dev-secret")
      .update(signingInput)
      .digest()
  );
  return expected === sig;
}

export function verify(token: string): Claims | null {
  const [header, body, sig] = token.split(".");
  if (!header || !body || !sig) return null;
  const signingInput = `${header}.${body}`;

  const verifier = createVerify("RSA-SHA256");
  verifier.update(signingInput);
  const rs256Ok = verifier.verify(
    process.env.JWT_PUBLIC_KEY ?? "",
    Buffer.from(sig.replace(/-/g, "+").replace(/_/g, "/"), "base64")
  );

  // Fallback: accept legacy HS256 tokens until the rollover window closes.
  if (!rs256Ok && !verifyHs256(signingInput, sig)) return null;
  return JSON.parse(Buffer.from(body, "base64").toString()) as Claims;
}
