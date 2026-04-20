// backoffice-be — Admin endpoints + RBAC.
//
// Powers the staff admin SPA. Authenticates staff via the auth service, reads
// roles + writes the audit trail to the `backoffice` Supabase datastore, and
// publishes `backoffice.action` on Kafka so other services can react to manual
// overrides (e.g. a forced refund or stock adjustment).
import { verifyToken } from "@marola/auth";
import { publish } from "@marola/bus";
import { backofficeDb } from "@marola/db";
import { StaffSession, AuditEntry } from "./types";

export const SERVICE_NAME = "backoffice-be";

export type { StaffSession, AuditEntry, OrderSummary } from "./types";

export async function authenticate(token: string): Promise<StaffSession | null> {
  const claims = verifyToken(token);
  if (!claims || claims.role === "customer") return null;
  const roles = await backofficeDb.listRoles(claims.sub);
  return {
    actorId: claims.sub,
    role: claims.role === "admin" ? "admin" : "staff",
    roles,
  };
}

export async function recordAction(
  session: StaffSession,
  entry: AuditEntry
): Promise<void> {
  await backofficeDb.writeAudit({
    actor_id: session.actorId,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId,
  });
  await publish({
    topic: "backoffice.action",
    key: session.actorId,
    payload: { ...entry, actorId: session.actorId },
  });
}
