-- customers datastore — owned by the @marola/customers service.
-- Canonical customer master with dedup chain (merged_into points at survivor).

create schema if not exists customers;

create table if not exists customers (
  id           text primary key,
  email        text not null,
  full_name    text not null,
  country      text not null,
  merged_into  text references customers (id),
  created_at   timestamptz not null default now()
);

create unique index if not exists customers_email_active_idx
  on customers (email) where merged_into is null;

create or replace function emails_with_duplicates()
returns table (email text) language sql as $$
  select email from customers
   where merged_into is null
   group by email having count(*) > 1;
$$;
