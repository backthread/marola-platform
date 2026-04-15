// @marola/db — per-service Supabase data-access modules.
//
// One typed slice per datastore. Services import the slice they own
// (e.g. `import { paymentsDb } from "@marola/db"`).
export { db } from "./client";
export * as ordersDb from "./orders";
export * as authDb from "./auth";
export * as inventoryDb from "./inventory";
export * as customersDb from "./customers";
export * as paymentsDb from "./payments";
