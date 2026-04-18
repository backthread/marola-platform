// hubspot client — CRM / sales & marketing. HubSpot CRM API v3.
//
// Orders, inventory and customers all push contact + deal updates here so the
// sales team sees Marola activity in HubSpot. OAuth2 partner app since the
// 2026-04 integration (RS256 JWT prep was for this).
export const PROVIDER = "hubspot";

const BASE = "https://api.hubapi.com/crm/v3";

function authHeader(): string {
  return `Bearer ${process.env.HUBSPOT_TOKEN ?? ""}`;
}

export interface ContactProps {
  email: string;
  firstname?: string;
  lastname?: string;
  country?: string;
}

export async function upsertContact(props: ContactProps): Promise<string> {
  const res = await fetch(`${BASE}/objects/contacts`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties: props }),
  });
  if (!res.ok && res.status !== 409) throw new Error(`hubspot: ${res.status}`);
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function recordDeal(
  contactId: string,
  amount: number,
  stage: string
): Promise<void> {
  const res = await fetch(`${BASE}/objects/deals`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { amount: String(amount), dealstage: stage },
      associations: [{ to: { id: contactId }, types: [] }],
    }),
  });
  if (!res.ok) throw new Error(`hubspot deal: ${res.status}`);
}
