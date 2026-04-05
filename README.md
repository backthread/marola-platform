# marola-platform

E-commerce platform powering Marola's Estonian online store (woo-1).

## Architecture

A small set of services behind an API gateway, backed by Supabase Postgres.

## Stack

- **Compute:** GCP (Cloud Run)
- **Database:** Supabase (Postgres) — one schema per service

## Layout

| Path | What |
|---|---|
| `services/*` | Backend services + the API gateway |
| `packages/*` | Shared libraries (`@marola/db`) |
| `infrastructure/*` | Supabase migrations |

## Channels

- woo-1 — WooCommerce B2C (EE)
