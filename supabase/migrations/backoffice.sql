-- backoffice datastore — owned by the @marola/backoffice-be service.
-- Staff RBAC role assignments + an append-only audit log of manual actions.

create schema if not exists backoffice;

create table if not exists role_assignments (
  actor_id  text not null,
  role      text not null,
  granted_at timestamptz not null default now(),
  primary key (actor_id, role)
);

create table if not exists audit_log (
  id         bigint generated always as identity primary key,
  actor_id   text not null,
  action     text not null,
  entity     text not null,
  entity_id  text not null,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_entity_idx on audit_log (entity, entity_id);
