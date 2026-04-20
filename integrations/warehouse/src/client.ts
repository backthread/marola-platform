// warehouse client — 3rd-party WMS (Easyship).
//
// The inventory service calls out here to read live on-hand quantities and to
// hand off fulfilment for paid orders. This is the source of truth for stock
// that inventory then mirrors into Supabase + broadcasts on Kafka.
export const PROVIDER = "warehouse";

const BASE = "https://api.easyship.com/2024-09";

function authHeader(): string {
  return `Bearer ${process.env.EASYSHIP_TOKEN ?? ""}`;
}

export interface WmsStock {
  sku: string;
  available: number;
}

export async function fetchStock(skus: string[]): Promise<WmsStock[]> {
  const res = await fetch(`${BASE}/inventory?skus=${skus.join(",")}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error(`warehouse: ${res.status}`);
  const data = (await res.json()) as { items: WmsStock[] };
  return data.items;
}

export async function createFulfilment(
  orderId: string,
  lines: { sku: string; qty: number }[]
): Promise<void> {
  const res = await fetch(`${BASE}/shipments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reference: orderId, items: lines }),
  });
  if (!res.ok) throw new Error(`warehouse fulfilment: ${res.status}`);
}
