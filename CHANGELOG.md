# Changelog

All notable changes to UCD Canteen Hub are documented here.

---

## [Unreleased]

### Planned
- Database seeding (data.sql)
- Redis menu/canteen caching
- React frontend (v0)
- Jenkins CI/CD pipeline
- Docker deployment to Hetzner

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
  - This field is a denormalized read-only snapshot of the
    authoritative value on `Payment.paymentStatus`, but nothing
    previously enforced that — `cancelUnpaidOrders` mutated it
    directly via a bare setter
  - Add `OrderService.syncPaymentStatus()` as the only sanctioned
    write path; all four points where `Payment.paymentStatus`
    actually changes now call it

- **Dependency**: `stripe-java` 29.5.0 → 32.2.0 — SDK was pinned to
  API version `2025-10-29.clover` while the account default had
  moved to `2026-03-25.dahlia`, causing
  `EventDataObjectDeserializer` to silently fail and skip webhook
  processing

### Fixed
- **Webhook-triggered status updates threw and rolled back silently**
  - `updateOrderStatus()` requires an authenticated user for
    permission checks; Stripe webhooks and the `cancelUnpaidOrders`
    scheduled job run with no user in `SecurityContext`
  - Every webhook-driven transition (payment success, failure,
    refund-pending, refunded) threw
    `ResourceNotFoundException("anonymousUser")`, rolling back the
    whole transaction — `paymentStatus` silently stayed `PENDING`
    despite a successful charge
  - Add `updateOrderStatusSystemForced()`: same state machine and
    side effects, skips operator permission validation; used by all
    four webhook handlers and `cancelUnpaidOrders`
  - `cancelUnpaidOrders` no longer fabricates a `FAILED` payment
    status for orders that were never actually charged

- **Webhook endpoint returned 401**
  - Was whitelisted only under `HttpMethod.GET`; Stripe always sends
    webhooks as POST, which fell through to
    `anyRequest().authenticated()`
  - Moved to its own `permitAll()` rule with no method restriction —
    safety is enforced by Stripe signature verification inside
    `processStripeWebhook()`, not by Spring Security

### Tests
- `payment.http`: complete end-to-end refund flow — checkout session
  creation, payment completion, manager-triggered cancellation,
  `REFUND_PENDING` verification, async webhook confirmation to
  `REFUNDED`, terminal-state rejection
- All 11 steps verified against a live Stripe test session via
  Stripe CLI webhook forwarding

### Removed
- `AuthServiceImplTest`: referenced `JwtUtils.generateToken()` and
  `LoginResponse.getToken()`, both removed in the v0.8.0 dual-token
  refactor; no longer compiles

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