// inventory — Stock sync warehouse ↔ channels.
//
// Owns the `inventory` Supabase datastore (stock levels per SKU + warehouse).
// At this stage it only maintains the mirror table; the WMS feed and the async
// broadcast are added in later milestones.
import { inventoryDb } from "@marola/db";

export const SERVICE_NAME = "inventory";

export async function setOnHand(sku: string, onHand: number): Promise<void> {
  await inventoryDb.upsertStock({
    sku,
    warehouse: "easyship-tll",
    on_hand: onHand,
    reserved: 0,
  });
}

export async function reserveForOrder(
  lines: { sku: string; qty: number }[]
): Promise<void> {
  for (const line of lines) {
    await inventoryDb.adjustStock(line.sku, -line.qty);
  }
}
