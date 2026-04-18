// hubspot client — CRM / sales & marketing. HubSpot CRM API v3.
//
// Orders, inventory and customers all push contact + deal updates here so the
// sales team sees Marola activity in HubSpot. Uses the official
// `@hubspot/api-client` SDK (OAuth2 partner app since the 2026-04 integration;
// the RS256 JWT migration was prep for it).
import { Client as HubSpotClient } from "@hubspot/api-client";

export const PROVIDER = "hubspot";

let hubspot: HubSpotClient | null = null;

function client(): HubSpotClient {
  if (!hubspot) {
    hubspot = new HubSpotClient({ accessToken: process.env.HUBSPOT_TOKEN ?? "" });
  }
  return hubspot;
}

export interface ContactProps {
  email: string;
  firstname?: string;
  lastname?: string;
  country?: string;
}

export async function upsertContact(props: ContactProps): Promise<string> {
  const res = await client().crm.contacts.basicApi.create({
    properties: props as unknown as Record<string, string>,
    associations: [],
  });
  return res.id;
}

export async function recordDeal(
  contactId: string,
  amount: number,
  stage: string
): Promise<void> {
  await client().crm.deals.basicApi.create({
    properties: { amount: String(amount), dealstage: stage },
    associations: [
      {
        to: { id: contactId },
        types: [
          { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 },
        ],
      },
    ],
  });
}
