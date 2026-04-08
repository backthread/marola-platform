-- inventory datastore — owned by the @marola/inventory service.
-- Mirror of WMS on-hand + reservations, keyed by SKU + warehouse.

create schema if not exists inventory;

create table if not exists stock_levels (
  sku        text not null,
  warehouse  text not null,
  on_hand    integer not null default 0 check (on_hand >= 0),
  reserved   integer not null default 0 check (reserved >= 0),
  synced_at  timestamptz not null default now(),
  primary key (sku, warehouse)
);

create or replace function adjust_stock(p_sku text, p_delta integer)
returns void language sql as $$
  update stock_levels
     set reserved = reserved - p_delta,
         synced_at = now()
   where sku = p_sku;
$$;
