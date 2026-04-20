// backoffice-fe API client.
//
// Imports the shared types from the backend package so the SPA and the
// backoffice-be service agree on request/response shapes (single source of
// truth, no drift). All calls go through the api-gateway → backoffice-be.
import type { OrderSummary, StaffSession } from "@marola/backoffice-be";

const BASE = "/api/backoffice";

export async function fetchSession(token: string): Promise<StaffSession | null> {
  const res = await fetch(`${BASE}/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as StaffSession;
}

export async function listOrders(token: string): Promise<OrderSummary[]> {
  const res = await fetch(`${BASE}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return (await res.json()) as OrderSummary[];
}
