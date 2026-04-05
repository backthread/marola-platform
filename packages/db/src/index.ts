// @marola/db — per-service Supabase data-access modules.
//
// Each service imports the slice it owns. At this stage only the orders
// datastore exists; more are added as services are split out.
export { db } from "./client";
export * as ordersDb from "./orders";
