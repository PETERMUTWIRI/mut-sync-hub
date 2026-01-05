# Mut Sync Hub

Enterprise-grade documentation for the Mut Sync Hub platform — a Next.js + Prisma analytics platform with an embeddable Edge Agent for on-prem data ingestion.

## Table of contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Core systems](#core-systems)
- [Data flow](#data-flow)
- [Deployment & operations](#deployment--operations)
- [Developer setup](#developer-setup)
- [Testing & validation](#testing--validation)
- [Security & compliance](#security--compliance)
- [Contributing & support](#contributing--support)

## Overview

Mut Sync Hub is a modular analytics platform that collects data from disparate on-prem systems (POS, databases, CSVs, APIs), ingests and normalizes it, and provides dashboards, reports and programmatic access via API. It is designed for enterprise deployments with multi-tenant support, audit logs, rate-limiting, and a lightweight edge agent for environments that cannot push data directly to cloud APIs.

Key capabilities
- Multi-tenant data model and usage tracking via Prisma/Postgres.
- Pluggable ingestion: edge agent (`edge-agent/`) for on-prem collection, plus webhook and API ingestors.
- Admin and user-facing dashboards built with Next.js (app dir) and server-side API routes.
- Background scheduling and analytics reports persisted to the `AnalyticsReport` model.

## Architecture

- Frontend & API: Next.js application in `src/app/` serving both UI and serverless API routes.
- Persistence: PostgreSQL modeled with Prisma (`prisma/schema.prisma`). See [prisma/schema.prisma](prisma/schema.prisma).
- Edge Agent: Standalone Node agent that discovers local data sources and streams batches to the server over a socket tunnel (`edge-agent/src/index.js`). See [edge-agent/src/index.js](edge-agent/src/index.js).
- Realtime & events: Server exposes SSE and socket namespaces used by UI and edge agents for streaming data and notifications.
- Background workers: Job scheduling and ingestion polling are implemented as server-side routes and cron-like schedulers (see libs and `qstash` usage).

## Core systems

- Frontend UI (Next.js): located in `src/app/` with admin and user dashboards, protection, and SSE consumers for live notifications.
- API surface: route handlers under `src/app/api/*` — includes billing, analytics, admin, notifications, support, ingestion endpoints, and streaming routes.
- Database schema: comprehensive models for organizations, users, API keys, data sources, datasets, analytics reports, payments and audit logs. Primary schema at [prisma/schema.prisma](prisma/schema.prisma).
- Prisma client: `src/lib/prisma.ts` exposes a single `prisma` client instance used across server code. See [src/lib/prisma.ts](src/lib/prisma.ts).
- Edge Agent: `edge-agent/` contains a small packaged Node agent that detects local data stores (SQLite, CSV, MySQL, etc.) and uploads batches via socket.io to `/analytics` (auth via API key). See [edge-agent/src/uploader.js](edge-agent/src/uploader.js) and [edge-agent/src/db-sniffer.js](edge-agent/src/db-sniffer.js).
- Notifications & streaming: API routes expose SSE endpoints (`/api/notifications/stream`, `/api/admin/stream`) consumed by the UI for live updates.

## Data flow

1. Edge Agent (on-prem) detects a source (e.g., SQLite file, CSV directory) using `edge-agent/src/db-sniffer.js`.
2. Agent opens a socket.io tunnel to the server and emits `agentData` batches (`edge-agent/src/uploader.js`).
3. Server ingestion endpoints validate, normalize and persist rows into `DataSource`/`Dataset` models and enqueue analytics jobs.
4. Scheduled reports and background workers run analytics and write results to `AnalyticsReport`.
5. UI requests reports via API routes (`/api/reports`) and receives live updates via SSE or polling as configured.

## Deployment & operations

Recommended production components
- Web frontend / API: Deploy Next.js to Vercel, Cloud Run, or a Node server behind a load balancer.
- Database: Managed PostgreSQL (AWS RDS, Neon, supabase) with TLS and automated backups.
- Caching / Queues: Redis (for sessions, rate-limiting) and a background worker process for long-running jobs.
- Edge Agent distribution: Package via `pkg` (configured in `edge-agent/package.json`) and deploy to customer Windows/Linux hosts as a service (systemd / Windows Service).

Essential environment variables (update as needed)
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string (optional)
- `NEXT_PUBLIC_API_URL` — public frontend API base
- `SOCKET_SERVER_URL` — full URL for socket.io (used by agents)
- `SENTRY_DSN` — optional error reporting

Operational notes
- Use connection pooling and read replicas for large read workloads.
- Configure alerts on `ServiceStatus` degradation and critical audit log events.

## Developer setup

Prereqs: Node 20+, pnpm (recommended), PostgreSQL

Quick start (local development):

```bash
pnpm install
cp .env.example .env # create and edit env vars
npx prisma migrate dev --name init
pnpm dev
```

- The Next.js app runs on `http://localhost:3000` by default.
- Edge agent can be run locally for testing: `node edge-agent/src/index.js` (ensure agent config at `edge-agent/src/config.json` or let the template be written).

Key files & locations
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma)
- Prisma client wrapper: [src/lib/prisma.ts](src/lib/prisma.ts)
- Edge agent entry: [edge-agent/src/index.js](edge-agent/src/index.js)
- Agent uploader: [edge-agent/src/uploader.js](edge-agent/src/uploader.js)
- API route samples: see `src/app/api/` (admin, billing, reports, notifications)

## Testing & validation

- Run unit and integration tests (if present) with the project's test runner; otherwise use selective API checks against a local Postgres instance.
- Smoke test: run `pnpm dev`, create a test org, and exercise `/api/admin/system-status` and `/api/reports/sync`.

## Security & compliance

- Secrets: never store secrets in repo. Use your cloud provider secret manager or environment variables.
- API keys: rotate and scope API keys via `ApiKey` models; store hashed or opaque tokens where possible.
- Audit logs: all sensitive actions are recorded in `AuditLog` for traceability.

## Contributing & support

- Contributing: open PRs to `main` with tests and a clear description. Follow existing code style.
- Issues & support: open issues in this repository for bugs; use the `support` API routes for runtime tickets.


