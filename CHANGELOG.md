# Changelog

All notable changes to UCD Canteen Hub are documented here.
---

## [Unreleased]

### Planned
- Data seeding: realistic campus canteen menus for demo purposes
- Unit test coverage expansion
- README: setup guide, architecture overview, demo credentials

---
## [1.6.0] - 2026-07-26

### Added
- **Console-app: production deployment** — multi-stage Dockerfile (`output: 'standalone'`), `docker-compose.prod.yml` service entry, Nginx server block for `campuseats-admin.yuhanwang.dev` (existing wildcard cert already covered it), and `frontend/console-app/Jenkinsfile` mirroring customer-app's pipeline
- **`deploy/Jenkinsfile`**: syncs `docker-compose.prod.yml` and `nginx/` to the server on change — previously these had no automation path and could only be edited by hand

### Fixed
- **Jenkins jobs silently stuck for 19 days**: `Branches to build` had been updated from `feat/cicd` to `master`, but each job's internal "last built revision" bookmark stayed pinned to the old branch, so Git polling kept comparing against it and reported "No changes" on every push. Fixed by manually triggering one build per job to reset the bookmark
- **`git diff origin/master@{1}` failed on a job's first build** (no prior fetch to diff against). Unified all Jenkinsfiles onto backend's existing try/catch fallback pattern; customer-app and console-app had been using `HEAD~1 HEAD` instead, which also misses changes when a push bundles multiple commits
- **`/app/campuseats` on the server is not a Git checkout** — editing `docker-compose.prod.yml` or `nginx/` in the repo had no effect on the running server until manually copied over; now handled by `deploy/Jenkinsfile` via `scp`
- Console-app's Dockerfile referenced a non-existent `public/` directory (images come from S3 URLs, icons are `lucide-react` components, not static assets)
- Stale `@campuseats.ie` seed account passwords: `DataInitializer`'s `existsByEmail` check skips re-encoding on every deploy, so changing `ADMIN_PASSWORD` in `.env.prod` had no effect on existing rows; confirmed via direct `BCryptPasswordEncoder.matches()` before ruling out other causes. Deleting the rows also required clearing `user_roles` first (FK constraint)
- `.dockerignore` was empty in both frontend projects — local `node_modules` (~350MB) was uploaded to the Docker build context on every build

### Infrastructure
- Server had 0B swap; added a 4GB swap file, persisted via `/etc/fstab`
---

## [1.5.0] - 2026-07-25

### Added
- **Console-app: full backend integration** (Next.js 13, separate from customer-app due to incompatible dependency trees)
  - `AuthProvider` + role-aware route guard (`useRequireStaff`): non-admin/manager accounts are redirected even if authenticated
  - `effectiveCanteenId` pattern unifies manager's auto-locked canteen scope and admin's optional canteen selector across all five pages, since both hit the same canteen-scoped endpoints
  - 5 management pages wired to real APIs: Dashboard, Canteen Management (assign/remove manager), Menu Management, Order Management, Payments
  - Shared type definitions (`lib/canteen.ts`, `lib/order.ts`, `lib/user.ts`) extracted to avoid duplicate DTO definitions across pages

- **Backend: canteen/manager-scoped statistics endpoints**
  - `GET /canteens/managed` — manager looks up their own canteen without needing to already know its ID
  - `GET /canteens/admin-view` — admin-only view exposing manager assignment (kept separate from the public `CanteenDTO`, which intentionally hides `manager` via `@JsonIgnore`)
  - `GET /orders/canteens/{canteenId}/stats`,
    `GET /orders/stats/status-distribution`,
    `GET /orders/admin/stats/revenue/monthly`,
    `GET /payments/stats` — all accept an optional `canteenId`, serving both admin's global view and a manager's own-canteen view from a single endpoint, reusing the same ownership-check pattern (`manager.getEmail().equals(currentUserEmail)`) used elsewhere
  - `DELETE /canteens/{canteenId}/manager` — manager unassignment was previously impossible; only assignment existed
  - `DishServiceImpl`: added the same ownership check to create/update/delete — previously any manager could modify dishes belonging to a canteen they didn't manage

### Fixed
- `GlobalExceptionHandler` was mapping unmatched routes (`NoResourceFoundException`) to 500 instead of 404, indistinguishable from genuine server errors in logs


## [1.4.0] - 2026-07-07

### Added
- **Jenkins CI/CD pipeline**
  - Jenkins deployed as a containerized service (`jenkins/jenkins:lts`)
    on the same Hetzner server, alongside the rest of the stack;
    Docker socket mounted so Jenkins can build/push images without
    a nested Docker install
  - Three encrypted credentials configured: GitHub (repo access),
    Docker Hub (push access), server SSH key — none exposed in
    Jenkinsfile source
  - **Backend pipeline** (`Jenkinsfile`): Checkout → Maven build
    (in an isolated `maven:3.9-eclipse-temurin-21` container,
    matching the Dockerfile's build stage) → Docker build → push to
    Docker Hub → SSH deploy (`docker compose pull backend && up -d`)
  - **customer-app pipeline** (`frontend/customer-app/Jenkinsfile`):
    same structure, `npm ci` + `npm run build` in a `node:22-alpine`
    container; `dir('frontend/customer-app')` scopes build steps to
    the correct subdirectory within the monorepo checkout
  - GitHub Webhook configured — both pipelines now trigger
    automatically on push to `master`, replacing the manual
    build/push/SSH/pull/restart workflow used throughout initial
    deployment
  - **Path-based pipeline filtering**: both Jenkinsfiles include a
    "Check for relevant changes" stage comparing
    `origin/master@{1}...origin/master` (not just the immediately
    preceding commit) against each service's relevant paths, skipping
    the build when a push doesn't touch that service's files. Fails
    open (proceeds with full build) if the comparison itself fails,
    e.g. on a job's first run.

### Fixed
- **Docker Hub credential exposure risk in Jenkinsfile**: initial
  login step used direct `${}` string interpolation of the
  credential, flagged by Jenkins as an insecure pattern (risk of
  the password leaking into build logs if masking failed downstream).
  Replaced with `withCredentials(...)`, which explicitly scopes the
  secret and guarantees console output masking

### Changed
- `backend` service in `docker-compose.prod.yml`: removed unused
  `8090:8090` host port mapping — only the Nginx container (same
  Docker network) needs to reach it

---
## [1.3.1] - 2026-07-07

### Added
- **Nginx containerization**
  - Moved from system-level installation to a container within
    `docker-compose.prod.yml`, consistent with mysql/redis/backend
  - Mounts `/etc/letsencrypt` (read-only) and the local nginx config
    file — reverse proxy configuration is now version-controlled and
    reproducible, not a manually-maintained system file
  - `proxy_pass` targets changed from `localhost:PORT` to Docker
    service names (`customer-app:3000`, `backend:8090`) now that
    Nginx shares the same bridge network
  - `backend` no longer maps port 8090 to the host — only Nginx
    (same network) needs to reach it

- **HTTPS via Let's Encrypt / Certbot**
  - Certificate issued covering all production domains
  - Auto-renewal confirmed via `certbot.timer`

### Changed
- **Domain structure: second-level → first-level subdomains**
  - `api.campuseats.yuhanwang.dev` → `campuseats-api.yuhanwang.dev`
  - `admin.campuseats.yuhanwang.dev` → `campuseats-admin.yuhanwang.dev`
  - Root cause: Cloudflare's free Universal SSL certificate covers
    `*.yuhanwang.dev` (first-level wildcard only) and does not
    extend to second-level subdomains — TLS handshakes to the old
    domains failed at the Cloudflare edge with no certificate
    offered ("no peer certificate available"), while the same
    domains handshake successfully when tested directly against
    the origin server
  - Confirmed via side-by-side `openssl s_client`: direct
    origin connection succeeded; the equivalent request routed
    through Cloudflare's edge failed identically for both
    `api.*` and `admin.*`, succeeded for the first-level
    `campuseats.yuhanwang.dev`
- **`CorsConfig`**: added `https://campuseats.yuhanwang.dev` and
  `https://campuseats-admin.yuhanwang.dev` to `allowedOrigins`
- **`frontend/customer-app/.env.production`**:
  `NEXT_PUBLIC_API_BASE_URL` updated to `https://campuseats-api.yuhanwang.dev`

### Fixed
- **Nginx TLS cipher negotiation failure with Cloudflare**
  - `nginx:latest` ships OpenSSL 3.5.6, which defaults to
    negotiating `X25519MLKEM768` — a post-quantum hybrid key
    exchange algorithm not yet supported by the Cloudflare edge
    node this server connects through
  - Surfaced as `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` /
    `SSL_ERROR_NO_CYPHER_OVERLAP` in-browser, despite direct
    `openssl s_client` tests against localhost succeeding — the
    mismatch only appeared once traffic actually traversed
    Cloudflare's edge
  - Pinned `ssl_ecdh_curve X25519:prime256v1:secp384r1;` across all
    server blocks to force negotiation onto traditional,
    universally-supported curves
- `sites-enabled/default` (Ubuntu's default Nginx site) was
  intercepting requests despite a syntactically valid custom
  config — removed
- `certbot --nginx` plugin incompatible with containerized Nginx
  (`bind() to 0.0.0.0:443 failed: Address already in use` when
  attempting its own restart); switched to
  `certbot certonly --standalone` with Nginx temporarily stopped
  during certificate issuance

### Deployment
- Full stack (nginx, backend, mysql, redis, customer-app) verified
  running via Docker Compose on Hetzner
- End-to-end HTTPS confirmed working across all three production
  domains (campuseats / campuseats-api / campuseats-admin)
- `campuseats-api.yuhanwang.dev/api/v1/canteens` returns valid JSON
  through the full Cloudflare → Nginx → backend → MySQL path

---
## [1.3.0] - 2026-07-06

### Added
- **Production deployment infrastructure**
  - Multi-stage `Dockerfile` for backend: Maven build stage (cached dependency layer via separate `pom.xml` COPY) + JRE-only runtime stage, reducing final image size from ~500MB to ~175MB
  - `docker-compose.prod.yml`: three services (mysql, redis, backend) on an isolated bridge network; mysql/redis expose no host ports (only reachable internally); backend pulls from Docker Hub rather than building on the server, decoupling build and deploy
  - MySQL `healthcheck` (`mysqladmin ping`) with `depends_on: condition: service_healthy` on backend — ensures backend only starts after MySQL is verified ready, not merely after the container process has launched
  - `.env.prod` (gitignored) separates secrets from version-controlled config; `application.yml`/`application-prod.yml` reference all secrets via `${ENV_VAR}` placeholders, safe to commit

### Changed
- `application-prod.yml`: datasource and Redis hosts changed from `localhost` to Docker service names (`mysql`, `redis`) — required for container-to-container name resolution over the bridge network
- `CorsConfig`: explicit origins replacing wildcard; `PATCH` added to allowed methods

### Fixed
- **MySQL 8.0 default auth plugin incompatibility**: newly created users default to `caching_sha2_password`, which failed to complete
  the connection handshake with the JDBC driver in the absence of SSL — surfaced as a generic `Connection refused` rather than an
  authentication error, making it non-obvious to diagnose. Resolved via `ALTER USER ... IDENTIFIED WITH mysql_native_password`
- Docker Compose variable name mismatches (`.env.prod` vs compose file references) silently defaulted to blank strings instead of failing loudly
- Volume mount paths require absolute paths (`/var/lib/mysql`, not `var/lib/mysql`); Redis's official image persists at `/data`,
  not `/var/lib/redis`
- Stale Docker image: an image built and pushed before a config change (datasource host `localhost` → `mysql`) was deployed to the
  server, causing configuration drift between source and running container — resolved by rebuilding after confirming the packaged
  jar's `application-prod.yml` reflects the intended config
- `ddl-auto: validate` correctly rejected startup against a freshly initialized empty database (`missing table` errors) — expected
  behavior for the first deploy against a new schema, requiring a one-time `update` pass to establish the schema baseline

### Deployment
- Backend container verified running on Hetzner CX33 (Helsinki):
  container startup, schema validation, DataInitializer seed
  accounts, Stripe SDK initialization — all confirmed via container
  logs. **Not yet publicly accessible** — Nginx, domain routing,
  and HTTPS are still pending (tracked in Unreleased).
---
## [1.2.0] - 2026-06-26

### Added
- **Customer-app: full frontend integration (Next.js 16 / React 19)**
  - Two independent Next.js apps under `frontend/` (`customer-app`
    and `console-app`) kept separate due to incompatible dependency
    trees (Next 16/Tailwind v4/Base UI vs Next 13/Tailwind v3/Radix UI)
  - `lib/api/client.ts`: axios instance with request interceptor
    (auto-attaches Bearer token) and response interceptor (401 →
    silent refresh via `/api/v1/auth/refreshToken` → transparent
    retry; clears session and redirects to /login if refresh fails)
  - `AuthContext`: single source of truth for session state
    (`isLoggedIn`, `user: UserDTO`, `cartCount`); derived from
    `accessToken` presence; consumed by Navbar, AuthGuard, and
    all protected pages

- **11 customer-facing pages connected to backend API**
  - Public pages (no auth): Canteen list, Canteen menu, Dish detail
  - Auth-required pages: Cart (full CRUD, server recomputes totals),
    Stripe Hosted Checkout (create order → create session → redirect,
    no frontend SDK), Payment success, Profile, Edit profile
    (S3 avatar upload via `multipart/form-data`), Order history
    (paginated, cancel with optimistic local update, reorder),
    Leave/View review
  - Role-based UI: Add to Cart hidden for ROLE_ADMIN and ROLE_MANAGER;
    consistent with backend `@PreAuthorize("hasRole('STUDENT')")`

- **`GET /api/v1/reviews/order/{orderId}`** (backend)
  - Returns `List<ReviewDTO>` not `Page` — an order has a fixed
    small number of items; eliminates N parallel dish-review requests
    that would otherwise be needed for the View Review page

- **Navbar live cart badge**: `cartCount` in `AuthContext` updated
  optimistically on Add to Cart and synced from server after every
  cart mutation; hidden when count is 0

### Changed
- **Rebrand: UCD Canteen Hub → CampusEats**; UCD-specific copy
  replaced with campus-agnostic language throughout; footer
  attribution updated to Blair Wang with tech stack line
- **`CorsConfig`**: `allowedOrigins("*")` → explicit
  `localhost:3000` / `localhost:3001`; `allowedHeaders("*")` added
  for `Authorization` support; `allowCredentials(false)` explicit
- **`RegistrationRequest`**: `address` and `phoneNumber` `@NotBlank`
  removed — collected via Edit Profile post-registration instead

### Fixed
- CORS preflight rejecting `PATCH` requests from cart page
- Admin/Manager login triggering cart API 400 errors — frontend
  now guards at component level before requests fire

---

## [1.1.0] - 2026-06-20

### Added
- **Stripe refund flow**
  - `PaymentService.initiateRefund(orderId)`: calls Stripe's Refund
    API when a CONFIRMED order is cancelled, transitioning Payment
    to `REFUND_PENDING`
  - `charge.refunded` webhook handler confirms settlement, advancing
    both Payment and Order to `REFUNDED`
  - `OrderStatus.REFUNDED` and `PaymentStatus.REFUND_PENDING` added;
    `isValidTransition` now permits `CANCELLED -> REFUNDED`

- **Manager/admin order cancellation endpoint**
  - `POST /api/v1/orders/{orderId}/cancel-by-manager`: the state
    machine already permitted `CONFIRMED -> CANCELLED`, but no
    endpoint exposed it to managers/admins — only students could
    cancel, and only while `INITIALIZED`

### Changed
- **Refund trigger decoupled via Spring application events**
  - `OrderServiceImpl` no longer depends on `PaymentService` directly
    (previously worked around a circular dependency with `@Lazy`)
  - Order cancellation now publishes `OrderCancelledEvent`;
    `PaymentServiceImpl` listens via
    `@TransactionalEventListener(AFTER_COMMIT)`, so a failed Stripe
    refund call no longer rolls back the order cancellation itself

- **`Order.paymentStatus` sync path enforced**
  - This field is a denormalized read-only snapshot of the authoritative value on `Payment.paymentStatus`, but nothing previously enforced that — `cancelUnpaidOrders` mutated it directly via a bare setter
  - Add `OrderService.syncPaymentStatus()` as the only sanctioned write path; all four points where `Payment.paymentStatus` actually changes now call it

- **Dependency**: 
  - `stripe-java` 29.5.0 → 32.2.0 — SDK was pinned to API version `2025-10-29.clover` while the account default had moved to `2026-03-25.dahlia`, causing `EventDataObjectDeserializer` to silently fail and skip webhook processing

### Fixed
- **Webhook-triggered status updates threw and rolled back silently**
  - `updateOrderStatus()` requires an authenticated user for permission checks; Stripe webhooks and the `cancelUnpaidOrders` scheduled job run with no user in `SecurityContext`
  - Every webhook-driven transition (payment success, failure, refund-pending, refunded) threw `ResourceNotFoundException("anonymousUser")`, rolling back the whole transaction — `paymentStatus` silently stayed `PENDING` despite a successful charge
  - Add `updateOrderStatusSystemForced()`: same state machine and side effects, skips operator permission validation; used by all four webhook handlers and `cancelUnpaidOrders`
  - `cancelUnpaidOrders` no longer fabricates a `FAILED` payment status for orders that were never actually charged

- **Webhook endpoint returned 401**
  - Was whitelisted only under `HttpMethod.GET`; Stripe always sends webhooks as POST, which fell through to `anyRequest().authenticated()`
  - Moved to its own `permitAll()` rule with no method restriction — safety is enforced by Stripe signature verification inside `processStripeWebhook()`, not by Spring Security

### Tests
- `payment.http`: complete end-to-end refund flow — checkout session creation, payment completion, manager-triggered cancellation, `REFUND_PENDING` verification, async webhook confirmation to `REFUNDED`, terminal-state rejection
- All 11 steps verified against a live Stripe test session via Stripe CLI webhook forwarding

### Removed
- `AuthServiceImplTest`: referenced `JwtUtils.generateToken()` and `LoginResponse.getToken()`, both removed in the v0.8.0 dual-token refactor; no longer compiles

---
## [1.0.0] - 2026-06-18

### Added
- **Dish soft delete** (`@SQLDelete` + `@SQLRestriction`)
  - `@SQLDelete` intercepts `repository.delete()` calls and executes
    `UPDATE dishes SET is_deleted = true WHERE id = ? AND version = ?`
    instead of a physical `DELETE`
  - `@SQLRestriction("is_deleted = false")` automatically appends a filter
    to all Dish queries; soft-deleted dishes are invisible to `findByCanteenId`,
    `findByNameContainingIgnoreCase`, and duplicate-name validation without
    any additional repository changes
  - Removed composite `UNIQUE(canteen_id, name, is_deleted)` constraint —
    it allowed only one soft-deletion per dish name; duplicate-name validation
    is enforced at the service layer via `validateDishExists()`, which already
    respects the `@SQLRestriction` filter

- **Optimistic locking via `@Version`** on four entities
  - `Dish`: prevents lost updates when managers edit the same dish concurrently
  - `Canteen`: prevents lost updates when Admin and Manager edit the same
    canteen concurrently
  - `Order`: prevents conflicts when multiple actors (user, manager, system)
    trigger order status transitions concurrently
  - `Payment`: guards against duplicate processing caused by Stripe's
    at-least-once webhook delivery; complements the existing
    `transactionId` unique constraint

- **Docker Compose** (`docker-compose.yml` in project root)
  - MySQL 8.0 with named volume — data persists across `docker compose stop`
    and `docker compose down`; only `docker compose down -v` clears data
  - Redis 7.0 for JWT session management and future menu caching
  - Replaces manual local installation; `docker compose up -d` fully
    reproduces the dev environment on any machine

### Changed
- `@SQLDelete` SQL on `Dish` updated to include `AND version = ?` so that
  soft-deletes participate in the same optimistic locking contract as updates

### Tests
- `dish.http`: added soft delete verification
  - Verify soft-deleted dish does not appear in `GET /canteens/{id}/dishes`
    (confirms `@SQLRestriction` filter is active)
  - Verify same-name dish can be recreated after soft deletion
    (confirms unique constraint removal)

---

## [0.9.0] - 2026-06-08

### Added
- **Email verification(verify-before-create)**
  - `VerificationCodeService`: Redis-backed 6-digit OTP, key format `verify:{email}`,
    TTL 5 minutes, uses `StringRedisTemplate` for plain-string storage
  - `POST /api/v1/auth/send-code`: sends verification code email via
    `NotificationServiceImpl` (`@Async`); rejects already-registered emails early
  - `register()` now validates OTP against Redis before persisting `User`;
    `emailVerified` set to `true` on save — no unverified accounts reach the DB
  - `verificationCode` field added to `RegistrationRequest` with `@NotBlank` validation

- **Security hardening on registration flow**
  - Constant-time code comparison (`MessageDigest.isEqual`) replaces `String.equals()`
    to prevent timing attacks
  - Format guard (`\d{6}`) rejects malformed codes before Redis lookup
  - Rate limiting: one `/send-code` request per email per minute via separate Redis key
    (`rate:send-code:{email}`, TTL 60s); returns 429 on violation
  - `TooManyRequestsException` mapped to HTTP 429

- **Order confirmation email**
  - `NotificationService.sendOrderConfirmation(OrderDTO, String userEmail)`: renders
    Thymeleaf template, sends via `JavaMailSender` (`@Async`), saves audit log to DB
  - Triggered exclusively inside `handlePaymentSuccess()` after Stripe confirms charge,
    guarded by existing idempotency check — never fires before payment is settled
  - `order-confirmation.html`: pickup code as focal element; 

- **Swagger / OpenAPI documentation**
  - Auto-generated API docs via SpringDoc OpenAPI

### Changed
- `GlobalExceptionHandler`: added handlers for `TooManyRequestsException` (429)
  and `ConstraintViolationException` (400); the latter covers `@RequestParam`
  and `@PathVariable` validation failures that previously fell through to 500
- `@Email` on `send-code` param: hardcoded English message to prevent locale-dependent
  Chinese output on non-English OS environments
- `SecurityFilter`: whitelisted `/api/v1/auth/send-code` alongside `/login` and `/register`

### Fixed
- `OrderServiceImpl.cancelUnpaidOrders()`: status was incorrectly set to `FAILED`
  instead of `CANCELLED` for timeout-expired orders

### Tests
- `auth.http`: extended smoke test suite with full verification code flow
  (P1–P3 sad paths, S1–S6 student registration, A1–A2 admin, M1–M2 manager);
  replaced hardcoded emails with private env variables
---

## [0.8.0] - 2026-06-03

### Added
- `RedisTokenService`: Refresh Token lifecycle management (save / validate / delete / session check)
- `RedisConfig`: `RedisTemplate<String, Object>` with JSON serialization, reserved for future menu caching
- `POST /auth/refresh`: exchange Refresh Token for a new Access Token
- `POST /auth/logout`: revoke session by deleting Redis key; resolves user from SecurityContext
- `RefreshTokenRequest` DTO with `@NotBlank` validation
- `JwtException` handler in `GlobalExceptionHandler` returning 401 (covers `MalformedJwtException`, `ExpiredJwtException`, `SignatureException`)
- Smoke test suite for dual-token auth flow (15 scenarios: register, login, token type enforcement, refresh, logout, session revocation)

### Changed
- **Auth architecture**: replaced single 30-day JWT with dual-token design
  - Access Token: 15-minute expiry, carries `email + roles + type:access`
  - Refresh Token: 7-day expiry, carries `email + type:refresh`, stored in Redis
- `JwtUtils`: added `generateAccessToken()`, `generateRefreshToken()`, `extractTokenType()`, `extractRoles()`; removed `generateToken()`; extracted `REFRESH_EXPIRATION_DAYS` as public constant (single source of truth shared with `RedisTokenService`)
- `AuthFilter`: removed per-request DB query; validates `type=access`; extracts roles directly from JWT payload; `permitAll()` paths proceed on token exception instead of returning 401
- `AuthServiceImpl.login()`: now issues dual tokens and stores Refresh Token in Redis
- `LoginResponse`: renamed `token` → `accessToken`, added `refreshToken` field; `@JsonInclude(NON_NULL)` suppresses absent fields
- `SecurityUtils.getCurrentUserEmail()`: guarded against `null` and `anonymousUser` principal
- `@PreAuthorize` annotations: removed `ROLE_` prefix from `hasRole()` calls across `OrderController`, `ReviewController`, `PaymentController` (Spring Security prepends `ROLE_` automatically; `hasRole('ROLE_ADMIN')` was checking for `ROLE_ROLE_ADMIN`)

### Removed
- `role.http` smoke test (Role entity was replaced by `RoleType` enum in v0.7.0)
- Unused `AuthenticationManager` bean from `SecurityFilter`

---

## [0.7.0] - 2026-05-31

### Changed
- **Role architecture**: replaced `Role` JPA entity with `RoleType` enum across the entire codebase
  - Eliminated a dedicated `roles` database table
  - Roles now stored as JSON array in the `users` table
  - Simplified role assignment and query logic
- Updated `AuthServiceImpl`, `UserMapper`, `UserRepository` to use `RoleType`
- Fixed `PaymentMapper` MapStruct expression bug (`PaymentStatus` import and parameter name mismatch)
- Updated `AuthControllerIntegrationTest` and unit tests for new enum-based role model

### Removed
- `Role` entity, `RoleRepository`, `RoleService`, `RoleController`
- `role.http` smoke tests (module no longer exists)
- All Role-related DTO and mapper files

---

## [0.6.0] - 2026-04-28

### Added
- **Payment module** (Stripe integration)
  - `PaymentService` + `PaymentServiceImpl`: Stripe Checkout session creation, webhook handling with signature verification
  - `PaymentController`: checkout endpoint, webhook receiver, multi-role payment history
  - MapStruct `PaymentMapper` with `PaymentStatus` enum mapping
  - IDOR protection on payment queries (students can only view own payments)
  - Pagination sanitization across all paginated services

---

## [0.5.0] - 2026-04-08

### Added
- **Review module**
  - `ReviewService` + `ReviewServiceImpl`: create review, paginated retrieval by dish, average rating calculation
  - `ReviewController` with role-based access (`ROLE_STUDENT` only for write operations)
  - MapStruct `ReviewMapper` with pagination support
  - Smoke tests for review lifecycle

- **Order module**
  - `OrderService` + `OrderServiceImpl`: order placement, multi-role retrieval, cancellation, admin statistics
  - State machine: `PENDING → CONFIRMED → PREPARING → READY → COMPLETED / CANCELLED`
  - `OrderController` with secure multi-role endpoints
  - `pickupCode` field for high-concurrency collection scenarios
  - `EntityGraph` optimisation on order repository to prevent N+1 queries
  - Smoke tests for full order lifecycle

- **Cart module**
  - `CartService` + `CartServiceImpl`
  - `CartController`
  - MapStruct `CartMapper` + `CartItemMapper`; fixed boolean mapping for dish availability
  - Smoke tests for cart operations

---

## [0.4.0] - 2026-03-25

### Added
- **Dish module** (renamed from Menu to align with multi-canteen architecture)
  - `DishService` + `DishServiceImpl`: CRUD, keyword search, canteen-scoped queries
  - `DishController` with role-based access control
  - `DishMapper` (MapStruct)
  - Global `FileController` for centralised AWS S3 uploads
  - Smoke tests with automated S3 URL variable chaining

- **Canteen module**
  - `CanteenService` + `CanteenServiceImpl`: dynamic status engine, schedule sync logic
  - Holiday schedule and weekly schedule management
  - `CanteenController` with RESTful v1 API
  - Bidirectional relationship handling in manual mappers; soft delete logic
  - Smoke tests

- **User module**
  - `UserService` + `UserServiceImpl`: profile management, password change, avatar upload (AWS S3), admin actions (status update, role update)
  - `UserController` with self-service and admin endpoints
  - `ChangePasswordRequest` DTO

- **Auth module**
  - `AuthService` + `AuthServiceImpl`: registration, login with BCrypt
  - `AuthController`: `POST /auth/register`, `POST /auth/login`
  - `UserMapper` (MapStruct) for DTO conversion
  - Unit tests (`AuthServiceImplTest`) and MockMvc integration tests (`AuthControllerIntegrationTest`)
  - HTTP client smoke tests

### Changed
- `SecurityFilter`: updated for `/api/v1` path prefix; path-based authorization configured
- `GlobalExceptionHandler`: rebuilt with structured logging; added `MethodArgumentNotValidException` → 400

---

## [0.3.0] - 2026-02-22

### Added
- **AWS S3 integration**
  - S3 client configuration and `FileStorageService`
  - Unit tests with 100% logic coverage
  - Dev-profile controller and HTTP smoke test scripts for upload/delete lifecycle

- **Email / Notification service**
  - `NotificationService` + `NotificationServiceImpl` with JPA auditing
  - `EmailTestController` restricted to `dev` profile
  - Unit tests including exception handling for delivery failure

- **Role module** (later removed in v0.7.0)
  - `RoleService` + `RoleController` with decoupled architecture and fail-fast logic
  - `@NotBlank` validation on `RoleDTO`
  - Smoke tests and 100% unit test coverage

### Changed
- `Response<T>`: generic wrapper with static factory methods; added `timestamp` field
- `GlobalExceptionHandler`: centralised error handling with specialised exception classes
- `SecurityFilter`: permitted access to test and notification endpoints

---

## [0.2.0] - 2026-01-26

### Changed
- **Domain pivot**: project renamed from generic *Food Ordering App* to **UCD Canteen Hub**
  - New focus: unified ordering platform addressing fragmented operating hours across UCD campus canteens
  - Full ER diagram redesign for multi-canteen, multi-role architecture

### Added
- Core entity layer:
  - `User` + `Role` with JPA auditing and Spring Security integration
  - `Canteen` + `Menu` with scheduling logic
  - `Cart` + `CartItem` with unique constraints
  - `Order` + `OrderItem` with price snapshot logic
  - `Payment`, `Review`, `Notification`
- Initial repositories for all entities; unique constraint on menu name per canteen
- Full DTO layer: User, Auth, Canteen, Menu, Cart, CartItem, Order, Payment, Review, Notification
- Payment gateway enums updated for Irish market (Stripe, Revolut)
- `UserDetailsService` and `UserDetails` adapter for Spring Security

---

## [0.1.0] - 2025-11-22

### Added
- Spring Boot project initialisation
- Core enum classes for `OrderStatus`, `PaymentStatus`
- Secure `.gitignore` configuration

### Fixed
- Excluded vulnerable Logback and Tomcat transitive dependencies; enforced patched versions

---

## [0.0.1] - 2025-09-24

### Added
- Initial project setup: Spring Boot + MySQL + Spring Security skeleton
- Tutorial-based food ordering app foundation (subsequently replaced in v0.2.0)