// inventory — Stock sync warehouse ↔ channels.
//
// Reads live on-hand from the Easyship WMS, mirrors it into the `inventory`
// Supabase datastore, pushes low-stock signals into HubSpot for the sales team
// and broadcasts `inventory.changed` on Kafka so channels can reprice/hide SKUs.
import { publish } from "@marola/bus";
import { inventoryDb } from "@marola/db";
import { fetchStock, createFulfilment } from "@marola/warehouse";
import { upsertContact } from "@marola/hubspot";

export const SERVICE_NAME = "inventory";

export async function sync(skus: string[]): Promise<void> {
  const wms = await fetchStock(skus);
  for (const item of wms) {
    await inventoryDb.upsertStock({
      sku: item.sku,
      warehouse: "easyship-tll",
      on_hand: item.available,
      reserved: 0,
    });
    await publish({
      topic: "inventory.changed",
      key: item.sku,
      payload: { sku: item.sku, onHand: item.available },
    });
  }
}

export async function reserveForOrder(
  orderId: string,
  lines: { sku: string; qty: number }[]
): Promise<void> {
  for (const line of lines) {
    await inventoryDb.adjustStock(line.sku, -line.qty);
  }
  await createFulfilment(orderId, lines);
  // Notify CRM of a fulfilment touchpoint for the buyer.
  await upsertContact({ email: `order+${orderId}@marola.example` });
}
