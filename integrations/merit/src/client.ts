// merit client — Estonian accounting export (Merit Aktiva).
//
// The customers service pushes customer master records here so finance can
// raise invoices against a single deduplicated customer entity. Uses the
// `merit-aktiva` SDK, which handles Merit's HMAC request signing (apiId +
// apiKey) for us.
import { MeritApi } from "merit-aktiva";

export const PROVIDER = "merit";

let merit: MeritApi | null = null;

function client(): MeritApi {
  if (!merit) {
    merit = new MeritApi({
      apiId: process.env.MERIT_API_ID ?? "",
      apiKey: process.env.MERIT_API_KEY ?? "",
      country: "EE",
    });
  }
  return merit;
}

export interface CustomerExport {
  Name: string;
  RegNo?: string;
  CountryCode: string;
  Email: string;
}

export async function exportCustomer(c: CustomerExport): Promise<void> {
  await client().sendCustomer({
    Name: c.Name,
    RegNo: c.RegNo,
    CountryCode: c.CountryCode,
    Email: c.Email,
  });
}
