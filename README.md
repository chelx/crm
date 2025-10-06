# CRM System – NestJS + PostgreSQL + Prisma + Refine + Chakra UI

A modular CRM application with authentication, RBAC, customer and feedback management, reply approval workflow, notifications, audit logging, and reporting dashboards.

## Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Running](#running)
- [Testing](#testing)
- [Seed Data](#seed-data)
- [Core Flows](#core-flows)
- [Reporting & Dashboards](#reporting--dashboards)
- [Notifications](#notifications)
- [Security & Compliance Notes](#security--compliance-notes)
- [Deviations / Shortcuts (Local)](#deviations--shortcuts-local)
- [Production Readiness](#production-readiness)
- [Possible Use Cases](#possible-use-cases)

## Features
- **Auth & RBAC**
  - JWT access tokens, refresh tokens with rotation
  - Roles: CSO, MANAGER
- **Customers**
  - CRUD, soft delete, tags, merge duplicates (manager only)
- **Feedback**
  - Create feedback per customer, channels (email/phone/chat/social)
- **Replies**
  - Draft/Submit, Manager approve/reject with comments
- **Notifications**
  - In‑app notifications for approvals/rejections, customer updates, assignments
- **Audit Logging**
  - Records auth/login/refresh/logout, customers, replies, and more
- **Reporting & Dashboards**
  - Feedback volume (time series), reply performance, CSO workload
- **Theming & Accessibility**
  - Chakra UI with dark/light modes and contrast‑safe components

## Tech Stack
- Backend: NestJS, Prisma, PostgreSQL
- Frontend: React, Refine, Chakra UI, Vite
- Testing:
  - API: Jest + @nestjs/testing (unit)
  - Web (optional scaffolding): Vitest + RTL (currently disabled per project scope)

## Architecture
- Monorepo‑like structure
  - `apps/api` – NestJS API
  - `apps/web` – React SPA
  - `prisma` – schema & migrations (consumed by API)
- Backend modules follow NestJS modular design (`modules/*`)
- Prisma used for schema, migrations, and queries; explicit relations with indexes

## Local Setup
1) Prerequisites
- Node.js 18+
- PostgreSQL 14+

2) Install deps
```bash
# API
cd apps/api && npm i
# Web
cd ../web && npm i
```

3) Database
```bash
# From project root
cd apps/api
# Copy env
cp env.example .env
# Update DATABASE_URL to local Postgres
# Run migrations and generate client
npx prisma migrate dev
```

## Environment Variables
`apps/api/.env`
- `DATABASE_URL` – PostgreSQL URL
- `JWT_SECRET` – signing key
- `JWT_EXPIRES_IN` – e.g., `15m`
- `API_PREFIX` – default `v1`
- `PORT` – default `3001`
- `CORS_ORIGIN` – e.g., `http://localhost:3000`
- `BRUTE_FORCE_MAX_ATTEMPTS` – default `5`
- `BRUTE_FORCE_WINDOW_MS` – default `900000` (15m)
- `BRUTE_FORCE_LOCKOUT_MS` – default `1800000` (30m)
- `AUDIT_RETENTION_DAYS` – default `90`

`apps/web/.env`
- `VITE_API_URL` – e.g., `http://localhost:3001/v1`

## Running
Backend (API):
```bash
cd apps/api
npm run start:dev
```
Frontend (Web):
```bash
cd apps/web
npm run dev
# open http://localhost:3000
```

## Testing
API unit tests:
```bash
cd apps/api
npm test -- --runInBand
# with coverage (thresholds enabled in jest.config.js)
npm test -- --coverage
```
Notes:
- Auth extended tests are currently skipped by design; core auth unit tests remain.
- Frontend tests were intentionally removed per project focus on backend coverage.

## Seed Data
Use Prisma seed to create sample users and data if provided in `prisma/seed.ts`:
```bash
cd apps/api
npx prisma db seed
```
Default users (example):
- Manager: `manager@example.com` / `password123`

## Core Flows
- Login → access/refresh token stored locally (Refine AuthProvider)
- Customers: list, create, edit, soft delete; managers may merge duplicates
- Feedback: create per customer
- Replies: CSO drafts and submits; Manager approves/rejects
- Notifications: generated on reply approval/rejection, customer updates
- Audit Logs: managers can view `/audit` for activity; users can view their activity via API

## Reporting & Dashboards
- `/reports` (Manager only):
  - Feedback volume (groupBy day/week/month, date range, channel)
  - Reply performance (avg approval time & reply turnaround)
  - CSO workload
- `/` Dashboard:
  - High‑level stats from reports + recent activity (audits)

## Notifications
- `/notifications` page (CSO & Manager)
  - Filter by status, refresh, mark all as read
- Unread badge integrated into header bell (fetches `/notifications/unread-count`)

## Security & Compliance Notes
- Helmet (CSP, HSTS, Frameguard, Referrer‑Policy) enabled in API
- CORS tightened via env (origins, methods, headers)
- Brute‑force detection for login with lockout & audit events
- RBAC guard for protected routes & features
- Query parameterization via Prisma; no raw SQL unless necessary
- Audit retention cleanup via scheduled job (2AM daily; days configurable)

## Deviations / Shortcuts (Local)
- Auth extended unit tests are skipped to prioritize critical service coverage
- Frontend tests removed upon request; focus moved to backend testing
- Notifications page uses direct `fetch` for “mark all as read” instead of Refine mutation for brevity
- Some pages read API responses directly without fully typed adapters (kept simple for speed)

## Production Readiness
- CI/CD
  - Run tests with coverage gates; enable build, lint, type‑check
  - Containerize both apps; add health checks
- Security
  - Rotate secrets; store in secret manager
  - Enforce HTTPS and secure cookies; set CORS per environment; set stronger CSP if needed
  - Add rate limits per route; WAF/IDS per infra standards
- Observability
  - Centralized structured logging (e.g., pino) & tracing (OpenTelemetry)
  - Metrics for performance and error budgets
- Data
  - Backups & restore procedures; periodic drills
  - PII masking in non‑prod; field‑level encryption where required
- Performance
  - Add indexes for heavy queries; tune Prisma pool; enable query timeouts
- Frontend
  - Add e2e coverage; bundle analysis; route‑level code splitting
  - Improve error boundaries and retry UX on network failures

## Possible Use Cases
- Internal CS team handling customer feedback and responses
- Approval workflow where managers review and approve customer communication
- Audit‑heavy environments where activity tracking is mandatory
- Basic reporting for volume and throughput to guide staffing and SLAs

---
If you encounter any issues running locally, please open an issue or share logs from API (`apps/api`) and Web (`apps/web`) consoles for quicker troubleshooting.
