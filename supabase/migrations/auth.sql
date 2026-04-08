-- auth datastore — owned by the @marola/auth service.
-- Users + refresh-token rotation chain. Read-mostly from other services.

create schema if not exists auth;

create table if not exists users (
  id             text primary key,
  email          text not null unique,
  role           text not null default 'customer'
                   check (role in ('customer','staff','admin')),
  password_hash  text not null,
  created_at     timestamptz not null default now()
);

create table if not exists refresh_tokens (
  token_hash  text primary key,
  user_id     text not null references users (id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists refresh_tokens_user_idx on refresh_tokens (user_id);
