// @marola/db — per-service Supabase data-access modules.
//
// Re-exports each service's typed data-access surface. Services import the
// slice they own (e.g. `import { insertOrder } from "@marola/db/orders"`),
// but the barrel is handy for tooling + tests.
export { db } from "./client";
export * as ordersDb from "./orders";
export * as authDb from "./auth";
export * as inventoryDb from "./inventory";
export * as customersDb from "./customers";
export * as paymentsDb from "./payments";
export * as backofficeDb from "./backoffice";
