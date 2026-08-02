# CampusEats

A multi-canteen food ordering platform built to solve a real problem: fragmented, inconsistent opening hours across university campus canteens. Students browse menus, order, and pay across multiple canteens from one app; canteen managers and admins run day-to-day operations from a separate console.

**Live demo:** [campuseats.yuhanwang.dev](https://campuseats.yuhanwang.dev) (student-facing)
**Admin/manager console:** [campuseats-admin.yuhanwang.dev](https://campuseats-admin.yuhanwang.dev)

---

## Overview

CampusEats is a full-stack, multi-tenant food ordering system with three distinct user roles — student, canteen manager, and admin — each with scoped access enforced at both the API and UI layer. It covers the complete lifecycle of a food-ordering platform: browsing, cart, checkout with real Stripe payments, order status tracking, refunds, reviews, and a full back-office console for managing canteens, menus, orders, and payments.


## Tech Stack

**Backend**
- Spring Boot 3 (Java 21), Spring Security, JWT (dual-token: access + refresh)
- MySQL 8, Redis (session/token management)
- Stripe (Checkout Sessions + webhooks, event-driven refund flow)
- AWS S3 (avatar/dish image uploads)
- MapStruct, Lombok, SpringDoc OpenAPI

**Frontend**
- `customer-app` — Next.js 16 / React 19, Base UI
- `console-app` — Next.js 13, Radix UI / shadcn — separate app due to incompatible dependency trees between the two frontends
- TypeScript, Tailwind CSS, axios, recharts

**Infrastructure**
- Docker + Docker Compose (multi-stage builds, standalone Next.js output)
- Traefik (reverse proxy, TLS termination — certs auto-provisioned via Let's Encrypt per domain, shared across multiple projects on the host)
- Jenkins CI/CD — path-filtered pipelines per service in a monorepo, automatic build → push → deploy on push to `master`
- Hosted on a Hetzner VPS

## Architecture Highlights

- **Role-based access control**, enforced server-side via `@PreAuthorize` and ownership checks (a manager can only ever act on their own canteen — verified against `Canteen.manager`, not just role membership), and mirrored client-side via route guards for UX (not treated as the security boundary)
- **Soft delete + optimistic locking** on core entities (`Dish`, `Canteen`, `Order`, `Payment`) via `@SQLDelete`/`@SQLRestriction` and `@Version`
- **Event-driven refund flow**: order cancellation publishes a Spring application event; a `@TransactionalEventListener` triggers the Stripe refund asynchronously, decoupling the order and payment services and preventing a failed refund call from rolling back the cancellation itself
- **Dual-token JWT auth** with Redis-backed refresh token revocation
- Deliberately **not** microservices — the module coupling in this system reflects real transactional dependencies at this scale, not technical debt. Documented as a conscious trade-off rather than a gap.

## Repository Structure

```
├── src/                    # Spring Boot backend
├── frontend/
│   ├── customer-app/       # Student-facing ordering app
│   └── console-app/        # Admin/manager back office
├── deploy/                 # Deployment-config sync pipeline (Jenkinsfile)
├── docker-compose.prod.yml
└── CHANGELOG.md            # Detailed, dated history of every notable
                             # change, including root-cause writeups for
                             # non-trivial bugs
```

## Getting Started (local development)

```bash
# Backend
docker compose up -d          # MySQL + Redis
./mvnw spring-boot:run

# Customer-facing frontend
cd frontend/customer-app
npm install
npm run dev                   # localhost:3000

# Admin/manager console
cd frontend/console-app
npm install
npm run dev                   # localhost:3001
```

Environment variables are documented in `.env.example` (backend) — copy to `.env` and fill in local values. Secrets are never committed; all sensitive config is injected via environment variables in both local (`.env`, loaded via `spring-dotenv`) and production (`.env.prod`, Docker Compose `env_file`) environments.

## API Documentation

Interactive API docs available via SpringDoc OpenAPI at `/swagger-ui.html` when running locally. `api-tests/` contains `.http` smoke test suites covering the full auth, order, payment, and refund lifecycles.

## Notable Engineering Decisions

Detailed rationale for non-obvious decisions — why microservices weren't used, why Redis stores refresh tokens as a whitelist rather than an access token blacklist, why manager-owns-canteen checks live in the service layer rather than `@PreAuthorize` expressions, why `console-app` and `customer-app` are separate Next.js projects — is documented inline in code comments and in [`CHANGELOG.md`](./CHANGELOG.md), which doubles as a running engineering journal: every entry explains not just what changed, but why, including root causes for bugs that took real debugging effort to track down (a stale Docker image deployed before a config change, Cloudflare's free-tier certificate not covering second-level subdomains, MySQL 8's default auth plugin breaking JDBC connections, Jenkins jobs silently stuck on a stale branch for weeks, a single malformed Docker label silently disabling Traefik routing for an entire container, and others).

## Status

Actively developed. See [`CHANGELOG.md`](./CHANGELOG.md) `[Unreleased]` section for what's currently in progress.
