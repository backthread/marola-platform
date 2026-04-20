// merit client — Estonian accounting export (Merit Aktiva).
//
// The customers service pushes customer master records here so finance can
// raise invoices against a single deduplicated customer entity. Merit's API
// signs requests with an HMAC of the payload + an API id.
export const PROVIDER = "merit";

const BASE = "https://aktiva.merit.ee/api/v2";

function signature(payload: string): string {
  // HMAC-SHA256 over apiId + timestamp + payload, base64. Stubbed here.
  return Buffer.from(`${process.env.MERIT_API_ID ?? ""}:${payload}`).toString(
    "base64"
  );
}

export interface CustomerExport {
  Name: string;
  RegNo?: string;
  CountryCode: string;
  Email: string;
}

export async function exportCustomer(c: CustomerExport): Promise<void> {
  const payload = JSON.stringify(c);
  const res = await fetch(`${BASE}/sendcustomer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature": signature(payload),
    },
    body: payload,
  });
  if (!res.ok) throw new Error(`merit: ${res.status}`);
}
