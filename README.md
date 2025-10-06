# CRM System (Senior Dev Test)

NestJS + PostgreSQL + Prisma + React (Refine) + Chakra UI

## What’s Included
- Auth & RBAC (CSO, MANAGER); JWT access + refresh (rotation)
- Customers: CRUD, soft delete, merge duplicates (manager only)
- Feedback: capture by customer and channel
- Replies: Draft → Submit → Manager Approve/Reject (with comments)
- Notifications: in‑app (approve/reject, assignments, customer updates)
- Audit logging: auth/customer/reply activities, stats endpoint
- Reporting: feedback volume (day/week/month), reply performance, CSO workload

## Quick Start
Prerequisites: Node 18+, PostgreSQL 14+

1) Install
```bash
# API
cd apps/api && npm i
# Web
cd ../web && npm i
```

2) Database (API)
```bash
cd ../api
cp env.example .env           # set DATABASE_URL, JWT_SECRET
npx prisma migrate dev        # create tables
```

3) Run
```bash
# API
npm run start:dev  # http://localhost:3001/v1
# Web (in apps/web)
npm run dev        # http://localhost:3000
```

4) Login
- Seed user example (if seeded): `manager@example.com` / `password123`

## Minimal Architecture
- `apps/api`: NestJS; modules: `auth`, `customers`, `feedback`, `replies`, `notifications`, `audit`, `reports`
- `apps/web`: React + Refine + Chakra; routes under `/customers`, `/feedback`, `/replies`, `/notifications`, `/reports`, `/audit`
- `prisma`: schema & migrations (used by API)

## Environment
`apps/api/.env`
- `DATABASE_URL` (Postgres)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `PORT` (default 3001), `API_PREFIX` (default v1)
- `CORS_ORIGIN` (default http://localhost:3000)
- `BRUTE_FORCE_*`, `AUDIT_RETENTION_DAYS` (sane defaults)

`apps/web/.env`
- `VITE_API_URL` (default http://localhost:3001/v1)

## Testing (API)
```bash
cd apps/api
npm test -- --runInBand
npm test -- --coverage  # thresholds enforced in jest.config.js
```
Focus:
- Services: reports, replies (approve/reject), customers (update/merge), notifications, audit controller
- Extended auth tests deliberately skipped to prioritize critical paths

## How To Use (Happy Path)
- Create Customers → add Feedback
- Draft a Reply → Submit → Manager Approve/Reject
- See Notifications at `/notifications`; mark all as read
- Audit activity at `/audit` (manager)
- Dashboards at `/reports` (manager)

## Decisions & Trade‑offs (for the test)
- Prisma + PostgreSQL for reliability and velocity; explicit indexes and relations
- Reply workflow implemented fully (states + guards)
- In‑app notifications only (email/webhook omitted by scope)
- Security hardening applied: Helmet (CSP/HSTS), CORS via env, brute‑force lockout
- Frontend tests removed per requirement shift; strong unit tests on API services instead

## Shortcuts / Deviations (Local)
- Some UI actions use direct `fetch` for brevity (e.g., mark‑all‑read)
- API responses read directly in a few places (thin adapters) to keep focus on domain logic
- Auth extended tests skipped; core auth unit tests exist

## Making It Production‑Ready
- CI/CD: build/lint/type‑check/test with coverage gates; containerize; health checks
- Secrets: store in a secret manager; rotate regularly
- Networking: HTTPS, strict CORS, stronger CSP; rate limiting & WAF
- Observability: structured logs, tracing, metrics, alerts
- Data: backups + restore drills; PII policies; field‑level encryption where required
- Performance: tune DB pool, add missing indexes, query timeouts
- Frontend: add e2e tests; route‑level code splitting; error boundaries & retry UX

---
If anything fails locally, share API & Web console logs plus your `.env` shape (without secrets).
