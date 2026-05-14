# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project

**CMP (Course Management Portal)** — `slp-backend`
Organisation: Future CX Lanka (Pvt) Ltd

Node.js 20 · TypeScript 5 · Express 4 · Microservice Architecture · Firebase (Firestore, Auth, Storage, FCM) · npm workspaces monorepo

---

## Commands

```bash
# Full local dev startup (all 10 services — connects to online Firebase)
bash scripts/start.sh

# Install all workspace dependencies
npm install

# Run a single service in watch mode
npm run dev --workspace=packages/course-service

# Build a single service
npm run build --workspace=packages/course-service

# Type-check all workspaces
npm run type-check

# Lint all workspaces
npm run lint

# Format all workspaces
npm run format

# Run all unit tests
npm run test

# Run integration tests (requires Firebase emulators running)
npm run test:integration

# Run a single integration test file
npx jest --config jest.integration.config.ts packages/user-service/tests/integration/me.test.ts

# Run E2E tests (requires all services running via Docker Compose)
npm run test:e2e

# Run a single test file
npx jest packages/progress-service/tests/unit/application/ComputeCourseProgressUseCase.test.ts

# Start all services in watch mode without Docker (connects to online Firebase)
npm run dev:all

# Start all services locally via Docker (connects to online Firebase)
docker-compose up --build

# Start all services via Docker against local Firebase emulators
# Prerequisites: npx firebase emulators:start && node scripts/seed-emulator.js
docker-compose -f docker-compose.yml -f docker-compose.local.yml up --build

# Stop all services
docker-compose down

# Verify all 52 endpoints are reachable (requires all services running)
node scripts/smoke-test.js

# Deploy Firestore composite indexes to online Firebase (reads creds from .env.local)
node scripts/deploy-indexes-env.js

# Deploy Firestore composite indexes using GOOGLE_APPLICATION_CREDENTIALS env var
node scripts/deploy-indexes.js

# Seed online Firebase with test accounts (reads creds from .env.local)
node scripts/seed-online-env.js

# Seed emulator with test accounts (emulators must be running)
node scripts/seed-emulator.js

# Seed a single admin account in the emulator
node scripts/seed-admin.js

# One-time migration: backfill `roles` array on all users in online Firebase
# Usage: node scripts/migrate-roles.js path/to/serviceAccount.json
node scripts/migrate-roles.js

# Verify service endpoint availability
node scripts/verify-endpoints.js
```

---

## Architecture

### Monorepo Structure

```
packages/
  gateway/              # :3000  Single entry point; rate limiting, CORS, request ID, proxy
  auth-service/         # :3001  Token verification, registration, logout, lockout tracking
  user-service/         # :3002  User profiles, admin management, account lifecycle
  course-service/       # :3003  Courses → Semesters → Subjects → Lessons, course lifecycle state machine
  enrollment-service/   # :3004  Registration queue, enrollment approvals, bulk operations
  progress-service/     # :3005  Subject completion (idempotent), course progress aggregates
  storage-service/      # :3006  File upload/download, signed URLs; allowed MIME: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document; max 25 MB
  notification-service/ # :3007  In-app notifications, email (3-retry backoff), push (best-effort)
  audit-service/        # :3008  Append-only audit_log; purely event-driven
  outbox-worker/        #        Background worker — no HTTP port; polls outbox every 5 s
  shared/               # No Dockerfile — shared npm packages consumed by all services
k8s/                    # Kubernetes Deployment + HPA manifests (one folder per service)
postman/                # Postman collections for manual API testing
firebase.json           # Firebase CLI config — indexes, rules, emulator ports
firestore.indexes.json  # Composite indexes — required for any query combining where() + orderBy() on different fields, or filtering deletedAt + another field + ordering
firestore.rules         # Firestore security rules — update when adding new collections
storage.rules           # Firebase Storage security rules
```

### Gateway Path Rewriting

The gateway rewrites all proxied paths by stripping the `/api/v1` prefix before forwarding. A public request to `GET /api/v1/courses` becomes `GET /courses` at course-service:3003. **Routes inside each service must NOT include the `/api/v1` prefix.**

The gateway also blocks all `/api/v1/internal/*` paths with 404 before proxying — internal routes are never reachable from outside the cluster.

**Route ordering in `gateway/src/app.ts` is load-bearing.** More-specific prefixes must be registered before their broader siblings:
- `/api/v1/me/notifications`, `/api/v1/me/enrollments`, `/api/v1/me/progress` each before `/api/v1/me`
- `/api/v1/courses/:id/enroll` before `/api/v1/courses`
- `/api/v1/subjects/:id/lessons` (courseProxy) and `/api/v1/subjects/:id/attachments` (storageProxy) each before `/api/v1/subjects`
- `/api/v1/lessons` after the subject sub-routes

Adding a new proxied route in the wrong order will silently send traffic to the wrong service.

**Complete route→service map** (in registration order — first match wins):

| Path prefix | Service |
|------------|---------|
| `/api/v1/auth` | auth-service (+ `authLimiter`) |
| `/api/v1/me/notifications` | notification-service |
| `/api/v1/me/enrollments` | enrollment-service |
| `/api/v1/me/progress` | progress-service |
| `/api/v1/me`, `/api/v1/users`, `/api/v1/super-admin` | user-service |
| `/api/v1/courses/:id/enroll` | enrollment-service |
| `/api/v1/courses`, `/api/v1/semesters` | course-service |
| `/api/v1/subjects/:id/lessons` | course-service |
| `/api/v1/subjects/:id/attachments` | storage-service |
| `/api/v1/subjects`, `/api/v1/lessons` | course-service |
| `/api/v1/enrollments`, `/api/v1/admin/registrations`, `/api/v1/admin/enrollments` | enrollment-service |
| `/api/v1/progress`, `/api/v1/admin/progress` | progress-service |
| `/api/v1/attachments` | storage-service |
| `/api/v1/audit-log` | audit-service |

### Roles

| Role | Access |
|------|--------|
| `student` | Own profile, published courses, own enrollments, own progress |
| `admin` | All student access + user management, course management, enrollment approvals |
| `super_admin` | All admin access + admin account management, audit log access |

`super_admin` inherits all `admin` permissions inside `authorize()` — no need to list both roles on admin routes.

### Clean Architecture Layers (per service)

Each service enforces a strict one-way dependency chain:

```
http/          (routes, controllers, validators)      → application
application/   (use cases, event publishers, clients) → domain
domain/        (entities, value objects, repo interfaces — zero infrastructure)
infrastructure/(Firestore repos, Firebase SDK, email clients)
```

Controllers are thin — they call one use case and delegate errors with `next(err)`. All business rules live in use cases.

**Exception — notification-service and audit-service do not follow this pattern.** They have no controllers or use cases driven by HTTP. Instead they receive domain events from the outbox-worker over internal HTTP and process them through handler classes:

- `notification-service` — has `src/application/handlers/` (e.g. `UserRegisteredHandler`) that call a `NotificationDispatcher` service. Email dispatch retries 3× with exponential backoff (1 s → 2 s → 4 s); failure is logged but never thrown. Push notifications are best-effort — a failure logs a warning and is silently swallowed. The service still exposes `/notifications` read endpoints for the frontend via the standard route → controller path.
- `audit-service` — has `src/application/handlers/` that write append-only entries to `audit_log` via a repository. No HTTP creation endpoint exists; entries are only created by event handlers.

### Shared Packages

| Package | Key Exports |
|---------|------------|
| `@shared/auth-middleware` | `authenticate()`, `authorize()`, `mustBeOwnerOrAdmin()`, `AuthenticatedRequest`, `Principal`, `Role` |
| `@shared/errors` | `AppError`, `createHttpError()`, `fromZodError()`, `errorHandler` |
| `@shared/events` | `DomainEvent`, `OutboxEventPublisher` |
| `@shared/logger` | `logger` (Pino + redaction), `httpLogger` (pino-http) |
| `@shared/response` | `sendSuccess()`, `sendPaginated()` |
| `@shared/internal-http-client` | `createInternalClient()`, `runWithRequestId()`, `getRequestId()` |
| `@shared/health` | `healthRouter` (`/healthz`, `/readyz`) |
| `@shared/firebase` | `initFirebaseAdmin()` (idempotent) |
| `@shared/tracing` | `initTracing(serviceName)` |

**Request ID propagation via `AsyncLocalStorage`:** `@shared/internal-http-client` uses Node's `AsyncLocalStorage` to thread request IDs across service boundaries without explicit parameter passing. The gateway attaches a `requestId` middleware that generates an ID, sets `req.id`, and calls `runWithRequestId(id, next)` so the ID is stored in async context for the lifetime of that request. `createInternalClient()` reads it via `getRequestId()` in an Axios request interceptor and injects `X-Request-Id` automatically. This is why you never pass `requestId` through use case parameters.

### TypeScript Path Aliases

Two alias groups are in use, but they resolve differently:

- `@shared/*` — resolved at compile time via **npm workspace symlinks** (each service declares `"@shared/errors": "*"` etc. in its `package.json`). `tsconfig.base.json` has no `paths` for these. At test time, `jest.config.ts` maps them via `moduleNameMapper`.
- `@/*` → `src/*` — a TypeScript `paths` alias defined in each service's own `tsconfig.json` (not in `tsconfig.base.json`). Also mapped in `jest.config.ts` as `^@/(.*)$`.

### Dependency Injection

Manual constructor injection via a `container.ts` file per service. No DI framework. Instantiation order is always: repositories → infrastructure clients → use cases → controllers. Export a single `container` object.

### Per-Service config.ts

Every service reads environment variables in `src/config.ts` and exports a single `config` object typed `as const`. Never read `process.env` directly outside this file.

### Infrastructure Clients

Cross-service HTTP calls are wrapped in a client class under `src/infrastructure/clients/`. The class holds a private `createInternalClient()` instance and exposes typed methods. Instantiated in `container.ts` and injected into use cases.

### Controller Method Pattern

Controllers are classes with arrow-function methods (preserves `this`). Every method is `async`, accepts `(req, res, next)`, and wraps its body in `try/catch` forwarding to `next(err)`. Validate with `.safeParse()` before touching use cases.

```typescript
create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = createCourseSchema.safeParse(req.body);
    if (!parsed.success) return next(fromZodError(parsed.error));
    const result = await this.createCourseUseCase.execute(parsed.data);
    sendSuccess(res, result, 201);
  } catch (err) { next(err); }
};
```

### Validator Pattern

Zod schemas live in `src/http/validators/`. Use `.safeParse()` in the controller and convert failures with `fromZodError()` from `@shared/errors` — never throw Zod errors directly.

### Value Objects

Domain-layer validation that isn't trivial belongs in a value object at `src/domain/value-objects/`. Use a private constructor and a static `from()` factory that throws `createHttpError` on invalid input. No services currently have value objects, but the pattern is:

```typescript
export class SlugValue {
  private constructor(readonly value: string) {}
  static from(input: string | null | undefined): SlugValue | null {
    if (!input) return null;
    if (!/^[a-z0-9-]+$/.test(input))
      throw createHttpError(400, 'INVALID_SLUG', 'Slug may only contain lowercase letters, digits, and hyphens.');
    return new SlugValue(input);
  }
}
```

---

## Key Patterns

### Authentication & Authorisation

- Every authenticated route applies `authenticate()` then `authorize(...roles)` from `@shared/auth-middleware`.
- `authenticate()` calls `verifyIdToken(token, checkRevoked=true)` and attaches `req.principal = { uid, email, role, roles }` where `role` is the primary claim and `roles` is the full array (used by `authorize()` for effective-role checks).
- `super_admin` inherits all `admin` permissions inside `authorize()`.
- Ownership-sensitive routes add `mustBeOwnerOrAdmin()` after `authorize()`.
- **`tryAuthenticate()`** — used on public routes where the response shape differs by role (e.g., `GET /courses` shows DRAFT courses to admins but not students). It attaches `req.principal` if a valid Bearer token is present but never rejects missing or invalid tokens. This is **not** in `@shared/auth-middleware` — copy it to `src/http/middleware/tryAuthenticate.ts` in any service that needs it (currently only course-service has one).

### HTTP Status Code Policy

| Status | Trigger |
|--------|---------|
| 201 | Resource created (POST) |
| 204 | Successful DELETE |
| 400 | Zod validation failure |
| 401 | Missing / expired / revoked token |
| 403 | Valid token, wrong role or ownership |
| 404 | Resource not found (or DRAFT course accessed by student) |
| 409 | Duplicate email, duplicate enrollment, invalid state transition |
| 415 | Invalid attachment MIME type |
| 422 | Business rule violation (e.g., publish course with no subjects) |
| 429 | Rate limit exceeded |

### Logging

Never use `console.*` — the ESLint config treats it as an error (`no-console`). Unhandled promises are also a lint error (`no-floating-promises`) — always `await` or attach `.catch()`. Use `logger` from `@shared/logger` (Pino). Sensitive fields (`authorization`, `password`, `token`, `idToken`) are redacted automatically. Register `httpLogger` in `app.ts` for request/response logging.

### Middleware Order (app.ts)

Every service's `app.ts` must register middleware in this exact order or request logging and error propagation break:

```
helmet() → express.json() → httpLogger → routes → errorHandler (last)
```

The gateway additionally inserts `cors()`, `requestId`, and `generalLimiter` between `helmet()` and the route handlers. Note that `generalLimiter` is registered **after** `httpLogger` but **before** the health router, meaning health probes (`/healthz`, `/readyz`) are subject to rate limiting:

```
helmet() → cors() → requestId → httpLogger → generalLimiter → healthRouter → routes → errorHandler (last)
```

`errorHandler` must be the final middleware — Express identifies it by its four-argument signature `(err, req, res, next)`.

**Exception — the gateway does not register `errorHandler`.** It is a pure reverse proxy (`http-proxy-middleware`) with no business logic; all responses pass through from upstream services unchanged.

### Error Handling

Always use `createHttpError(status, 'ERROR_CODE', 'Human message')` from `@shared/errors`. Never throw plain `Error`. Controllers catch and forward with `next(err)`. The global `errorHandler` (registered last in `app.ts`) sanitises 5xx responses — stack traces never reach clients.

For multi-step operations that touch external systems (e.g., Firebase Auth then Firestore), clean up earlier writes on failure — e.g., delete the Firebase Auth user if the Firestore batch commit fails — to prevent orphaned records.

### Code Style

Prettier is configured in `.prettierrc` with non-default settings:

```
printWidth: 100        # not the common 80 — wrap at 100 chars
singleQuote: true
trailingComma: 'all'   # trailing commas on multi-line params, arrays, objects
arrowParens: 'avoid'   # omit parens for single-param arrow functions
```

### TypeScript Strictness

`tsconfig.base.json` enables `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`. Unused imports or parameters are compile errors, not warnings.

The ESLint config enforces:
- `no-console` — error (use `logger` from `@shared/logger`)
- `no-floating-promises`, `await-thenable`, `no-misused-promises` — errors
- `no-explicit-any` — **warning** only (not an error)
- Unused variables prefixed with `_` are allowed (e.g., `_req`, `_next`)
- ESLint runs with TypeScript type-checking (`recommended-requiring-type-checking`), so type errors surface at lint time too

### Transactional Outbox Pattern

Domain events are never lost. Services write to the `outbox` Firestore collection atomically alongside primary data (using a `WriteBatch`). The outbox-worker polls every 5 seconds and dispatches to notification-service and audit-service via internal HTTP. Max 5 attempts; failed events stay as `status: 'failed'` for investigation.

`OutboxEventPublisher.publishWithBatch(event, batch?)` accepts an optional `WriteBatch`. Always pass the same batch used for the primary write so the outbox entry and the entity are committed in a single atomic operation.

**Outbox event status lifecycle:**
```
pending → processing → delivered
                  ↘ (on failure, retried up to 5×, then) → failed
```
`processedAt` is set only on `delivered`. Within a single event, handlers are called **sequentially** (for-await loop) — a handler failure stops remaining handlers for that event and the event is retried on the next poll cycle. Failed events remain queryable for manual investigation.

Across a batch, the worker uses `Promise.allSettled()` so one event's failure does not abort processing of the remaining events in the same poll cycle.

The outbox-worker's `EventDispatcher` routes each event type to one or more handlers. The full event routing table:

| Event type | Handlers |
|-----------|---------|
| `user.registered` | notify, audit |
| `registration.approved` | user-service `/internal/users/approve`, notify, audit |
| `registration.rejected` | notify, audit |
| `enrollment.pending` | notify, audit |
| `enrollment.approved` | notify, audit |
| `enrollment.rejected` | notify, audit |
| `enrollment.withdrawn` | audit |
| `course.published` | notify, audit |
| `progress.subjectCompleted` | audit |
| `admin.created` | audit |
| `admin.suspended` | notify, audit |
| `audit.action` | audit |

### Firestore Collection Ownership

No service reads another service's Firestore collections directly. Cross-service data access is only via internal HTTP calls using `createInternalClient()`.

| Collection | Owning Service | Document ID |
|-----------|---------------|-------------|
| `users` | user-service | Firebase Auth UID |
| `loginAttempts` | auth-service | **email address** — unique among all collections; every other collection uses UID |
| `passwordResetOtps` | auth-service | **email address** — stores 6-digit OTP, `expiresAt` (ISO string), `attempts` counter |
| `courses` | course-service | auto UUID |
| `courses/{id}/semesters` | course-service | auto UUID |
| `courses/{id}/semesters/{id}/subjects` | course-service | auto UUID |
| `lessons` | course-service | auto UUID — flat collection; fields: `title`, `description`, `youtubeVideoId` (nullable), `attachmentIds[]`, `subjectId`, `semesterId`, `courseId` foreign keys, `order` |
| `registrations` | enrollment-service | Firebase Auth UID (studentUid) |
| `enrollments` | enrollment-service | `${studentUid}_${courseId}` |
| `progress` | progress-service | `${studentUid}_${subjectId}` |
| `notifications` | notification-service | auto UUID |
| `audit_log` | audit-service | auto UUID (append-only, immutable) |
| `outbox` | all services (write) / outbox-worker (read) | auto UUID |

### Enrollment-Service: Two Distinct Flows

enrollment-service manages two separate domain entities and state machines:

**Registration** — tracks a student's one-time account approval by an admin:
```
pending → approve() → approved
       → reject()  → rejected
```

**Enrollment** — tracks per-course enrollment after account is approved:
```
pending → approve()  → approved → withdraw() → withdrawn
       → reject()   → rejected
        (pending also withdrawable)
```

### Course Lifecycle State Machine

```
DRAFT → publish() → PUBLISHED → archive() → ARCHIVED
        ← unpublish() ←
```

`publish()` requires: ≥ 1 semester AND every semester has ≥ 1 subject.

**Schema note:** `Course` has three user-defined fields: `title`, `description` (max 500 chars, default `""`), and `coverImageUrl` (URL or `null`, default `null`). `Semester` and `Subject` have only `title`. Richer per-lesson content (`description`, `youtubeVideoId`, `attachmentIds`) lives on `Lesson`. There are no value objects in course-service at this time.

### Denormalized Counters & Ordering

`Course` carries `semesterCount` and `Semester` carries `subjectCount`. These are **not** computed on read — they are maintained by use cases:
- `CreateSemesterUseCase` increments `course.semesterCount` and saves the course in the same operation
- `DeleteSemesterUseCase` decrements it
- `CreateSubjectUseCase` increments `semester.subjectCount`; `DeleteSubjectUseCase` decrements it

Any new use case that adds or removes a semester/subject must also update the corresponding parent counter or the publish-validation counts will drift.

Both `Semester` and `Subject` have an `order` field assigned as `existing.length + 1` on create. Order is **not** resequenced after deletion — gaps are expected and callers should sort by `order` rather than treating it as a dense sequence.

### Progress Idempotency

`MarkSubjectCompleteUseCase` is idempotent — if a subject is already `completed`, it returns the existing record unchanged. `completedAt` is immutable once set.

### Firebase Identity Toolkit REST Calls

Some Firebase Auth operations (password verification, password reset email) are not available in the Admin SDK and must be called directly via the Firebase Identity Toolkit REST API. `FirebaseAuthClient.verifyPassword` (user-service) uses this for sign-in.

The emulator branch is selected via `FIREBASE_AUTH_EMULATOR_HOST` (set automatically by `docker-compose.local.yml`). `FIREBASE_WEB_API_KEY` (client key, not service account) is required — set it in `.env`.

### Password Reset: Two-Step OTP Flow

Password reset is a two-step process to prevent email enumeration and unauthorised resets:

**Step 1 — `POST /auth/password-reset { email }`**  
Generates a 6-digit OTP, stores it in `passwordResetOtps` (15 min TTL, `attempts: 0`), and sends the OTP via SMTP email (`EmailClient`). Always returns 204 regardless of whether the email exists.

**Step 2 — `POST /auth/password-reset/verify { email, otp }`**  
Validates the OTP (max 5 attempts; expired or over-limit records are deleted). On success: deletes the OTP record and triggers a Firebase password reset email via `accounts:sendOobCode`. On failure: returns 400 with remaining attempts count. The Firebase call is fire-and-forget (errors silently swallowed).

```typescript
const url = `${base}/accounts:sendOobCode?key=${config.firebaseWebApiKey}`;
await fetch(url, { method: 'POST', body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }) })
  .catch(() => undefined);
```

### Soft Deletes

Courses, semesters, subjects, and users are soft-deleted by setting `deletedAt` timestamp (recoverable within 30 days). Queries filter `where('deletedAt', '==', null)`.

### Internal Service Communication

Synchronous calls use `createInternalClient(serviceUrl, INTERNAL_SERVICE_KEY)`, which automatically propagates `X-Request-Id`, applies a 5-second timeout, and retries once on 5xx with a 500 ms delay. The retry is tracked via a `_retried` flag on the Axios config to prevent infinite loops — a second failure surfaces immediately to the caller.

| Caller | Callee | Purpose |
|--------|--------|---------|
| auth-service | user-service | Email uniqueness check on registration |
| auth-service | enrollment-service | Create registration record after user creation (fire-and-forget) |
| enrollment-service | user-service | Update account status on approve/reject |
| enrollment-service | course-service | Verify course is PUBLISHED before enrollment |
| progress-service | course-service | Get total subject count for progress % |
| storage-service | course-service | Verify subject exists before upload |
| outbox-worker | user-service | Approve user account on `registration.approved` event |

### Repository Pagination Pattern

All list repository methods return `{ items, nextCursor, total }`. Cursor is the last document ID (or `null` when exhausted). Pass `cursor` to Firestore `.startAfter()` for the next page. Repository interfaces live in `src/domain/repositories/I*Repository.ts`; implementations in `src/infrastructure/repositories/Firestore*Repository.ts`. Each implementation uses a private `toEntity(id, data)` helper to convert Firestore `DocumentSnapshot` data to domain entities.

### Internal Route Auth Pattern

Every service protects its `/internal/*` routes with a local `internalAuth` middleware (`src/http/middleware/internalAuth.ts`) that validates the `X-Internal-Service-Key` header against `INTERNAL_SERVICE_KEY`. Each service has its own copy — there is no shared version. Callers use `createInternalClient()` which attaches the key automatically.

### Response Envelope Shapes

Success and error responses have **asymmetric shapes** — this is intentional:

- `sendSuccess(res, data, status?)` — sends `data` **directly** with no wrapper (e.g., `{ id, name, ... }`)
- `sendPaginated(res, items, nextCursor, total)` — wraps as `{ items, nextCursor, total }`
- Error responses always use `{ error: { code: 'ERROR_CODE', message: '...' }, requestId: '...' }`

The `requestId` is at the root of error responses (not nested inside `error`) so clients can correlate failures with server logs via `X-Request-Id`.

---

## Environment

Copy `.env.example` to `.env` (gitignored). Required variables:

```
# Service identity
SERVICE_NAME, SERVICE_VERSION, PORT, NODE_ENV, LOG_LEVEL

# Firebase Admin SDK (all services)
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
FIREBASE_STORAGE_BUCKET
FIREBASE_WEB_API_KEY                    # Firebase web client key (auth-service password reset + user-service change-password)

# Inter-service URLs (set all even if unused by a given service)
SERVICE_AUTH_URL … SERVICE_AUDIT_URL

# Internal service authentication
INTERNAL_SERVICE_KEY                    # shared secret for /internal/* routes

# Email (notification-service)
EMAIL_PROVIDER                          # "sendgrid" | "console"
SENDGRID_API_KEY, EMAIL_FROM

# Email (auth-service — OTP delivery)
SMTP_HOST, SMTP_PORT                    # defaults: smtp.gmail.com / 587
SMTP_USER, SMTP_PASS                    # SMTP credentials for OTP emails

# Gateway
ALLOWED_ORIGINS                         # comma-separated CORS allowlist
RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX    # global rate limit
AUTH_RATE_LIMIT_MAX                     # stricter limit for /auth/* routes

# Service-specific
ATTACHMENT_MAX_SIZE_BYTES               # storage-service (default: 26214400)
OUTBOX_POLL_INTERVAL_SECONDS            # outbox-worker (default: 5)
OUTBOX_BATCH_SIZE                       # outbox-worker (default: 20)
ENROLLMENT_REJECTION_COOLOFF_HOURS      # enrollment-service

# Observability
OTEL_SERVICE_NAME                       # OpenTelemetry service name for tracing
```

---

## Testing

Two Jest configs exist in the repo. A third (`jest.e2e.config.ts`) is referenced in `package.json` but has not been created yet.

| Config | Command | Scope | Timeout |
|--------|---------|-------|---------|
| `jest.config.ts` | `npm run test` | `tests/unit/**/*.test.ts` | default |
| `jest.integration.config.ts` | `npm run test:integration` | `tests/integration/**/*.test.ts` | 30 s |
| *(missing)* `jest.e2e.config.ts` | `npm run test:e2e` | `tests/e2e/**/*.test.ts` | — |

- **Unit tests** — No I/O. Mock repositories and service clients. Files live under `tests/unit/application/` and `tests/unit/domain/`.
- **Integration tests** — Jest + Firestore emulator. Test use cases + repositories end-to-end. Run serially (`maxWorkers: 1`) because all tests share a single emulator instance. `jest.integration.config.ts` loads `tests/integration/setup.ts` via `setupFiles` to initialise emulator environment variables before tests run.
- **E2E tests** — Supertest + all services running via Docker Compose. `jest.e2e.config.ts` must be created before `npm run test:e2e` works.
- **Firestore Security Rules** — `@firebase/rules-unit-testing`. Verify that client-side writes to `audit_log` are denied and that each service's collections enforce expected rules.

**Local seed accounts** (created by `node scripts/seed-emulator.js`, emulators must be running):

| Role | Email | Password | Status |
|------|-------|----------|--------|
| `super_admin` | `superadmin@cmp.com` | `SuperAdmin@123` | approved |
| `admin` | `admin@cmp.com` | `Admin@12345` | approved |
| `student` | `student1@cmp.com` | `Student1@123` | pending_approval |
| `student` | `student2@cmp.com` | `Student2@123` | approved |

**Firebase emulator ports** (from `firebase.json`): Auth `9099`, Firestore `8080`, Storage `9199`, UI `4000` (`http://localhost:4000`).

Use `jest.clearAllMocks()` in `beforeEach` to prevent test bleed. Integration tests use the Firebase emulator — `tests/integration/setup.ts` automatically sets `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` and `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` with fake credentials, so no real Firebase project credentials are needed. Just ensure the emulators are running before `npm run test:integration`.

Coverage thresholds enforced by `jest.config.ts`: branches 70%, functions/lines/statements 80%. `index.ts` and `server.ts` are excluded from coverage collection.

---

## Custom Slash Commands

Project-specific commands live in `.claude/commands/`. Use them with `/command-name` in Claude Code.

| Command | File | What it does |
|---------|------|-------------|
| `/feature-spec-creator` | `git.md` | Create a feature spec file + git branch from a short description |
| `/new-service` | `new-service.md` | Scaffold a complete microservice (all 4 layers, Dockerfile, package.json) |
| `/new-endpoint` | `new-endpoint.md` | Add a route + controller + use case + Zod validator + container wiring |
| `/new-use-case` | `new-use-case.md` | Scaffold a use case (standard / with-event / idempotent templates) |
| `/new-event` | `new-event.md` | Add a domain event — publisher, notification handler, outbox dispatcher wiring |
| `/new-repository` | `new-repository.md` | Scaffold a Firestore repository with interface, implementation, and cursor pagination |
| `/firestore-index` | `firestore-index.md` | Generate a composite index entry for `firestore.indexes.json` |
| `/test-unit` | `test-unit.md` | Generate Jest unit tests for a use case |
| `/test-integration` | `test-integration.md` | Generate Supertest + Firestore emulator integration tests for an endpoint |
| `/test-security` | `test-security.md` | Audit a service's routes for missing auth guards and Zod validators (report only) |
| `/run-check` | `run-check.md` | Run type-check + lint + unit tests for one service or all workspaces |

---

## Specification Files

All specification files live in `.claude/specs/`. Read the relevant spec before implementing any feature — it defines acceptance criteria, endpoints, domain events, Firestore changes, and security constraints that the implementation must satisfy.

| File | Scope | Contents |
|------|-------|----------|
| `cmp-backend.md` | Entire project | Master spec: ~60 acceptance criteria across all 10 services, endpoint inventory, domain events, Firestore schema, security constraints, NFRs, out-of-scope |
| `requirements.md` | Entire project | Full functional requirements (FR-AUTH, FR-SADM, FR-ADM, FR-STU, FR-CRS, FR-ENR, FR-LRN, FR-NOT), non-functional requirements (NFR-SEC, NFR-SCL, NFR-AVL, NFR-PRF), architectural constraints, SRS traceability table |
| `authentication-spec.md` | auth-service, shared/auth-middleware | Registration flow, login flow, logout flow, password reset, `authenticate()` middleware, `authorize()` RBAC, ownership guard, account lockout (10 attempts / 15 min), public endpoints, internal service auth |
| `deployment-spec.md` | All services | Local dev setup, environment variables reference, Dockerfile pattern, Docker Compose ports, Kubernetes Deployment + HPA config, CI/CD pipeline stages, Firebase index + rules deployment, backup/recovery targets, observability (logging, tracing, metrics, alerts) |
| `api-spec.md` | All services (via gateway) | API conventions, all 45+ endpoints with request/response schemas, HTTP status code policy, full error code reference, domain events reference |

**Feature specs** (generated by `/feature-spec-creator`) are also saved here as `<slug>.md`. When a new feature is specced, its file appears in this folder before any code is written.

When reading a spec to implement a feature:
- **Acceptance Criteria** defines what must be true — write tests against these
- **Security Constraints** defines auth/authz/validation rules — these are non-negotiable
- **Firestore Changes** lists any new composite indexes needed in `firestore.indexes.json`
- **Domain Events** lists what the outbox must publish and who consumes it
- **Out of Scope** tells you what NOT to build — do not add features listed there

---

## Reference Documents

- **`.claude/blueprint/Backend_Blueprint.md`** — Full architecture specification, implementation patterns, all use case code samples, security requirements traceability.
- **`.claude/APIdocument/API_Document.md`** — Complete REST API reference (all endpoints, request/response schemas, error codes). **This document has been audited and corrected to match the actual implementation** — field names, response status codes, and request bodies reflect the real code, not the original spec.
- **`.claude/tracker/tracker.md`** — Phase-by-phase implementation checklist (Phases 0–13). Update `[ ]` → `[x]` as work completes. Check this before starting any phase to understand what's done and what's blocked.
- **`.claude/plan/implementation-plan.md`** — Detailed implementation plan with phase dependencies and sequencing.
- **`.claude/sprints/`** — Per-sprint breakdown (`sprint-1-*.md` through `sprint-7-*.md`) with user stories and acceptance criteria.
