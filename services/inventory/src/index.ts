// inventory — Stock sync warehouse ↔ channels.
//
// Maintains the `inventory` Supabase datastore, broadcasts `inventory.changed`
// on Kafka, and (since the HubSpot integration) pushes a CRM touchpoint when a
// SKU goes low so the sales team can chase wholesale buyers.
import { publish } from "@marola/bus";
import { inventoryDb } from "@marola/db";
import { upsertContact } from "@marola/hubspot";

export const SERVICE_NAME = "inventory";

export async function setOnHand(sku: string, onHand: number): Promise<void> {
  await inventoryDb.upsertStock({
    sku,
    warehouse: "easyship-tll",
    on_hand: onHand,
    reserved: 0,
  });
  await publish({
    topic: "inventory.changed",
    key: sku,
    payload: { sku, onHand },
  });
  if (onHand < 5) {
    await upsertContact({ email: `restock+${sku}@marola.example` });
  }
}

export async function reserveForOrder(
  lines: { sku: string; qty: number }[]
): Promise<void> {
  for (const line of lines) {
    await inventoryDb.adjustStock(line.sku, -line.qty);
  }
}
