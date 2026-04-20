# marola-platform

E-commerce + retail platform powering Marola's online stores (EE & LV) and the
wholesale channel.

## Architecture

See the live "how it works" diagram with per-merge decision history:
**https://app.backthread.dev/backthread/marola-platform**

## Stack

- **Compute:** GCP (Cloud Run + Cloud Run jobs for batch)
- **Database:** Supabase (Postgres) — one schema per service
- **Async messaging:** Confluent Kafka (`@marola/bus`)
- **CRM:** HubSpot
- **Accounting:** Merit (EE)
- **Payments:** Stripe Connect
- **WMS:** Easyship
- **Analytics:** PostHog

## Layout

| Path | What |
|---|---|
| `services/*` | Backend services + the two gateways (`api-gateway`, `webhooks`) |
| `apps/*` | Frontends (`backoffice-fe`) |
| `integrations/*` | One thin HTTP client per third-party SaaS |
| `packages/*` | Shared libraries (`@marola/bus`, `@marola/db`) |
| `tools/*` | Scheduled batch jobs (reconciler, dedup-sweeper) |
| `infrastructure/*` | Supabase migrations, Kafka topic definitions |

## Channels

- woo-1 — WooCommerce B2C (EE)
- woo-2 — WooCommerce B2C (LV)
- magento — wholesale
