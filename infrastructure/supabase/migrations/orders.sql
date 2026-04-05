-- orders datastore — owned by the @marola/orders service.
-- One row per order from any channel (woo-1, woo-2, magento, pos-fleet).

create schema if not exists orders;

create table if not exists orders (
  id           text primary key,
  channel      text not null check (channel in ('woo-1','woo-2','magento','pos-fleet')),
  customer_id  text not null,
  total_cents  integer not null check (total_cents >= 0),
  currency     text not null default 'EUR',
  status       text not null default 'pending'
                 check (status in ('pending','paid','fulfilled','cancelled')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists orders_customer_idx on orders (customer_id);
create index if not exists orders_channel_idx  on orders (channel, created_at desc);
