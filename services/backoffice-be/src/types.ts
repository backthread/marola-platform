// Shared backoffice types — consumed by both the backend and the staff SPA
// (apps/backoffice-fe imports these so request/response shapes stay in sync).
export interface StaffSession {
  actorId: string;
  role: "staff" | "admin";
  roles: string[];
}

export interface AuditEntry {
  action: string;
  entity: string;
  entityId: string;
}

export interface OrderSummary {
  id: string;
  channel: string;
  status: string;
  totalCents: number;
  currency: string;
}
