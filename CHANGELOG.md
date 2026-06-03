# Changelog

All notable changes to UCD Canteen Hub are documented here.

---

## [Unreleased]

### Planned
- Email verification via OTP (Gmail SMTP)
- Order notification emails
- Database seeding
- React frontend (v0)
- Jenkins CI/CD pipeline
- Docker deployment to Hetzner

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