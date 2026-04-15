-- payments datastore — owned by the @marola/payments service.
-- One row per Stripe payment intent + its reconciled state.

create schema if not exists payments;

create table if not exists payments (
  id                text primary key,
  order_id          text not null,
  stripe_intent_id  text not null unique,
  amount_cents      integer not null check (amount_cents >= 0),
  currency          text not null default 'EUR',
  status            text not null default 'requires_payment'
                      check (status in
                        ('requires_payment','succeeded','refunded','failed')),
  created_at        timestamptz not null default now()
);

create index if not exists payments_order_idx  on payments (order_id);
create index if not exists payments_status_idx on payments (status, created_at);
