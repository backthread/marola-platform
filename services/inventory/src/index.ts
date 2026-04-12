// inventory — Stock sync warehouse ↔ channels.
//
// Maintains the `inventory` Supabase datastore and, since the Kafka migration,
// broadcasts `inventory.changed` on the bus so channels can hide/reprice SKUs
// without inventory calling them directly.
import { publish } from "@marola/bus";
import { inventoryDb } from "@marola/db";

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
}

export async function reserveForOrder(
  lines: { sku: string; qty: number }[]
): Promise<void> {
  for (const line of lines) {
    await inventoryDb.adjustStock(line.sku, -line.qty);
  }
}
