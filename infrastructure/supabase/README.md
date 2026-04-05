# Supabase (Postgres) — Marola data layer

The canonical migrations now live at the repo root under
[`supabase/migrations/`](../../supabase/migrations) — the standard Supabase CLI
layout (`supabase db push` / `supabase start` read it there). They were moved
out of `infrastructure/` in PR #6's scaffold so the Supabase tooling picks them
up without extra config.

Each service owns its own tables on the shared Marola Postgres instance:

| Migration | Owning service | Tables |
|---|---|---|
| `orders.sql`      | `@marola/orders`        | `orders` |
| `auth.sql`        | `@marola/auth`          | `users`, `refresh_tokens` |
| `inventory.sql`   | `@marola/inventory`     | `stock_levels` |
| `customers.sql`   | `@marola/customers`     | `customers` |
| `payments.sql`    | `@marola/payments`      | `payments` |
| `backoffice.sql`  | `@marola/backoffice-be` | `role_assignments`, `audit_log` |

Data access goes through `@marola/db` (`packages/db`), which wraps a single
configured `@supabase/supabase-js` client; each service imports only its own
slice (`import { ordersDb } from "@marola/db"`).
