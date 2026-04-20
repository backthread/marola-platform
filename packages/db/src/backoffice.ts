// backoffice data-access — reads/writes the `backoffice` Supabase datastore.
import { db } from "./client";

export interface AuditRow {
  id: string;
  actor_id: string;
  action: string;
  entity: string;
  entity_id: string;
}

export async function writeAudit(entry: Omit<AuditRow, "id">): Promise<void> {
  const { error } = await db().from("audit_log").insert(entry);
  if (error) throw new Error(`backoffice.audit.insert: ${error.message}`);
}

export async function listRoles(actorId: string): Promise<string[]> {
  const { data } = await db()
    .from("role_assignments")
    .select("role")
    .eq("actor_id", actorId);
  return (data ?? []).map((r: { role: string }) => r.role);
}
