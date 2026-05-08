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

# Run E2E tests (requires all services running via Docker Compose)
npm run test:e2e

# Run a single test file
npx jest packages/progress-service/tests/unit/ComputeCourseProgressUseCase.test.ts

# Start Firebase emulators (Firestore, Auth, Storage)
npx firebase emulators:start --only firestore,auth,storage

# Start all services locally
docker-compose up --build

# Stop all services
docker-compose down
```

---

## Architecture

### Monorepo Structure

```
packages/
  gateway/              # :3000  Single entry point; rate limiting, CORS, request ID, proxy
  auth-service/         # :3001  Token verification, registration, logout, lockout tracking
  user-service/         # :3002  User profiles, admin management, account lifecycle
  course-service/       # :3003  Courses → Semesters → Subjects, course lifecycle state machine
  enrollment-service/   # :3004  Registration queue, enrollment approvals, bulk operations
  progress-service/     # :3005  Subject completion (idempotent), course progress aggregates
  storage-service/      # :3006  File upload/download (PDF/DOC/DOCX, 25 MB max), signed URLs
  notification-service/ # :3007  In-app notifications, email (3-retry backoff), push (best-effort)
  audit-service/        # :3008  Append-only audit_log; purely event-driven
  outbox-worker/        # :3009  Polls `outbox` collection every 5 s; dispatches to notification + audit
  shared/               # No Dockerfile — shared npm packages consumed by all services
```

### Clean Architecture Layers (per service)

Each service enforces a strict one-way dependency chain:

```
http/          (routes, controllers, validators)      → application
application/   (use cases, event publishers, clients) → domain
domain/        (entities, value objects, repo interfaces — zero infrastructure)
infrastructure/(Firestore repos, Firebase SDK, email clients)
```

Controllers are thin — they call one use case and delegate errors with `next(err)`. All business rules live in use cases.

### Shared Packages

| Package | Key Exports |
|---------|------------|
| `@shared/auth-middleware` | `authenticate()`, `authorize()`, `mustBeOwnerOrAdmin()`, `AuthenticatedRequest` |
| `@shared/errors` | `AppError`, `createHttpError()`, `fromZodError()`, `errorHandler` |
| `@shared/events` | `DomainEvent`, `OutboxEventPublisher` |
| `@shared/logger` | `logger` (Pino + redaction), `httpLogger` (pino-http) |
| `@shared/response` | `sendSuccess()`, `sendPaginated()` |
| `@shared/internal-http-client` | `createInternalClient()` |
| `@shared/health` | `healthRouter` (`/healthz`, `/readyz`) |
| `@shared/firebase` | `initFirebaseAdmin()` (idempotent) |
| `@shared/tracing` | `initTracing(serviceName)` |

### Dependency Injection

Manual constructor injection via a `container.ts` file per service. No DI framework. Repositories are instantiated first, then use cases, then controllers.

---

## Key Patterns

### Authentication & Authorisation

- Every authenticated route applies `authenticate()` then `authorize(...roles)` from `@shared/auth-middleware`.
- `authenticate()` calls `verifyIdToken(token, checkRevoked=true)` and attaches `req.principal = { uid, email, role }`.
- `super_admin` inherits all `admin` permissions inside `authorize()`.
- Ownership-sensitive routes add `mustBeOwnerOrAdmin()` after `authorize()`.

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

### Error Handling

Always use `createHttpError(status, 'ERROR_CODE', 'Human message')` from `@shared/errors`. Never throw plain `Error`. Controllers catch and forward with `next(err)`. The global `errorHandler` (registered last in `app.ts`) sanitises 5xx responses — stack traces never reach clients.

### Transactional Outbox Pattern

Domain events are never lost. Services write to the `outbox` Firestore collection atomically alongside primary data (using a `WriteBatch`). The outbox-worker polls every 5 seconds and dispatches to notification-service and audit-service via internal HTTP. Max 5 attempts; failed events stay as `status: 'failed'` for investigation.

### Firestore Collection Ownership

No service reads another service's Firestore collections directly. Cross-service data access is only via internal HTTP calls using `createInternalClient()`.

| Collection | Owning Service | Document ID |
|-----------|---------------|-------------|
| `users` | user-service | Firebase Auth UID |
| `courses` | course-service | auto UUID |
| `courses/{id}/semesters` | course-service | auto UUID |
| `courses/{id}/semesters/{id}/subjects` | course-service | auto UUID |
| `enrollments` | enrollment-service | `${studentUid}_${courseId}` |
| `progress` | progress-service | `${studentUid}_${subjectId}` |
| `notifications` | notification-service | auto UUID |
| `audit_log` | audit-service | auto UUID (append-only, immutable) |
| `outbox` | all services (write) / outbox-worker (read) | auto UUID |

### Course Lifecycle State Machine

```
DRAFT → publish() → PUBLISHED → archive() → ARCHIVED
        ← unpublish() ←
```

`publish()` requires: ≥ 1 semester AND every semester has ≥ 1 subject.

### Progress Idempotency

`MarkSubjectCompleteUseCase` is idempotent — if a subject is already `completed`, it returns the existing record unchanged. `completedAt` is immutable once set.

### Soft Deletes

Courses, semesters, subjects, and users are soft-deleted by setting `deletedAt` timestamp (recoverable within 30 days). Queries filter `where('deletedAt', '==', null)`.

### Internal Service Communication

Synchronous calls use `createInternalClient(serviceUrl, INTERNAL_SERVICE_KEY)`, which automatically propagates `X-Request-Id`, applies a 5-second timeout, and retries once on 5xx.

| Caller | Callee | Purpose |
|--------|--------|---------|
| auth-service | user-service | Email uniqueness check on registration |
| enrollment-service | user-service | Update account status on approve/reject |
| enrollment-service | course-service | Verify course is PUBLISHED before enrollment |
| progress-service | course-service | Get total subject count for progress % |
| storage-service | course-service | Verify subject exists before upload |

---

## Environment

Copy `.env.example` to `.env.local` (gitignored). Required variables:

```
SERVICE_NAME, PORT, NODE_ENV, LOG_LEVEL
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
SERVICE_AUTH_URL … SERVICE_AUDIT_URL   # inter-service URLs
INTERNAL_SERVICE_KEY                    # shared secret for /internal/* routes
SENDGRID_API_KEY, EMAIL_FROM
FIREBASE_STORAGE_BUCKET
ALLOWED_ORIGINS                         # comma-separated CORS allowlist
```

---

## Testing

- **Unit tests** — Jest, no I/O. Mock repositories and service clients. File pattern: `tests/unit/*.test.ts`.
- **Integration tests** — Jest + Firestore emulator. Test use cases + repositories end-to-end. File pattern: `tests/integration/*.test.ts`.
- **E2E tests** — Supertest + all services running. File pattern: `tests/e2e/*.test.ts`.
- **Firestore Security Rules** — `@firebase/rules-unit-testing`. Verify that client-side writes to `audit_log` are denied and that each service's collections enforce expected rules.

Use `jest.clearAllMocks()` in `beforeEach` to prevent test bleed. Integration tests require `npx firebase emulators:start --only firestore,auth,storage` to be running first.

---

## Reference Documents

- **`.claude/blueprint/Backend_Blueprint.md`** — Full architecture specification, implementation patterns, all use case code samples, security requirements traceability.
- **`.claude/APIdocument/API_Document.md`** — Complete REST API reference (all endpoints, request/response schemas, error codes).
