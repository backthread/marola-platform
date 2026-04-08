// inventory data-access — reads/writes the `inventory` Supabase datastore.
import { db } from "./client";

export interface StockRow {
  sku: string;
  warehouse: string;
  on_hand: number;
  reserved: number;
}

export async function getStock(sku: string): Promise<StockRow | null> {
  const { data } = await db()
    .from("stock_levels")
    .select("*")
    .eq("sku", sku)
    .single();
  return (data as StockRow) ?? null;
}

export async function adjustStock(sku: string, delta: number): Promise<void> {
  const { error } = await db().rpc("adjust_stock", { p_sku: sku, p_delta: delta });
  if (error) throw new Error(`inventory.adjust: ${error.message}`);
}

export async function upsertStock(row: StockRow): Promise<void> {
  const { error } = await db().from("stock_levels").upsert(row);
  if (error) throw new Error(`inventory.upsert: ${error.message}`);
}
