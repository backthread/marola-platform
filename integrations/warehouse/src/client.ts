// warehouse client — 3rd-party WMS / shipping (EasyPost).
//
// The inventory service calls out here to read live on-hand quantities and to
// hand off fulfilment for paid orders. This is the source of truth for stock
// that inventory then mirrors into Supabase + broadcasts on Kafka. Uses the
// official `@easypost/api` SDK.
import EasyPost from "@easypost/api";

export const PROVIDER = "warehouse";

let easypost: EasyPost | null = null;

function client(): EasyPost {
  if (!easypost) {
    easypost = new EasyPost(process.env.EASYPOST_API_KEY ?? "");
  }
  return easypost;
}

export interface WmsStock {
  sku: string;
  available: number;
}

export async function fetchStock(skus: string[]): Promise<WmsStock[]> {
  const inv = await client().Inventory.retrieveBySkus(skus);
  return inv.items.map((i: { sku: string; available: number }) => ({
    sku: i.sku,
    available: i.available,
  }));
}

export async function createFulfilment(
  orderId: string,
  lines: { sku: string; qty: number }[]
): Promise<void> {
  const shipment = await client().Shipment.create({
    reference: orderId,
    options: { print_custom_1: orderId },
  });
  await client().Shipment.buy(shipment.id, shipment.lowestRate());
}
