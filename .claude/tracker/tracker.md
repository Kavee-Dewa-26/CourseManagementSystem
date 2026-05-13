# CMP Backend — Implementation Tracker

**Project:** Course Management Portal (`slp-backend`)  
**Organisation:** Future CX Lanka (Pvt) Ltd  
**Version:** 1.0.0  
**Last Updated:** 2026-05-13 (API_Document.md fully re-audited and synced with code — 24 discrepancies fixed, sections 13.2-20 completed; CLAUDE.md factual errors corrected; unit tests 177/177 passing ✅; smoke test 53/53 passing ✅)

> Update this file as implementation progresses. Change `[ ]` to `[x]` when a task is done.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Complete |
| `[!]` | Blocked |

---

## Phase 0 — Project Setup

- [x] Monorepo root `package.json` with npm workspaces
- [x] Root `tsconfig.base.json`
- [x] Root `.eslintrc.json`
- [x] Root `.prettierrc`
- [x] Root `jest.config.ts`
- [x] Root `jest.integration.config.ts`
- [x] `docker-compose.yml`
- [x] `.env.example`
- [x] `.gitignore`
- [ ] Firebase project created (Firestore, Auth, Storage enabled) — running on local emulators for now
- [x] Firebase emulators configured (`firebase.json`)

---

## Phase 1 — Shared Packages (`packages/shared/`)

### `@shared/firebase`
- [x] `initFirebaseAdmin()` — idempotent Firebase Admin SDK init

### `@shared/logger`
- [x] Pino logger with redaction (`authorization`, `password`, `token`, `idToken`)
- [x] `httpLogger` (pino-http middleware)

### `@shared/errors`
- [x] `AppError` class
- [x] `createHttpError()` factory
- [x] `fromZodError()` converter
- [x] `errorHandler` Express middleware (sanitises 5xx)

### `@shared/auth-middleware`
- [x] `authenticate()` — verifies Firebase ID token with `checkRevoked=true`
- [x] `authorize(...roles)` — RBAC; `super_admin` inherits `admin`
- [x] `mustBeOwnerOrAdmin()` — ownership guard
- [x] `AuthenticatedRequest` type

### `@shared/response`
- [x] `sendSuccess()` helper
- [x] `sendPaginated()` helper

### `@shared/events`
- [x] `DomainEvent` type
- [x] `OutboxEventPublisher` — writes to `outbox` collection

### `@shared/internal-http-client`
- [x] `createInternalClient()` — axios with `X-Internal-Service-Key`, 5 s timeout, 1 retry on 5xx

### `@shared/health`
- [x] `healthRouter` — `/healthz` (liveness) + `/readyz` (Firestore probe)

### `@shared/tracing`
- [x] `initTracing(serviceName)` — OpenTelemetry SDK init

---

## Phase 2 — API Gateway (`packages/gateway/`)

- [x] `app.ts` — Express app with middleware stack
- [x] Helmet security headers
- [x] CORS allowlist middleware
- [x] Request ID middleware (`X-Request-Id` UUID v4)
- [x] Pino HTTP logger
- [x] General rate limiter (200 req/min per IP)
- [x] Auth rate limiter (10 req/min per IP on `/auth/*`)
- [x] Reverse proxy to all downstream services (`pathRewrite` strips `/api/v1` using `req.originalUrl`)
- [x] `Dockerfile`
- [x] `package.json`
- [x] Postman collection (`postman/CMP_Backend.postman_collection.json` + `CMP_Local.postman_environment.json`)
- [x] `scripts/start.sh` — single-command local startup (emulators + seed + all 10 services)
- [x] `scripts/seed-emulator.js` — seeds 4 test accounts (super_admin, admin, student×2)
- [x] `scripts/seed-admin.js` — standalone admin seed utility
- [x] `scripts/smoke-test.js` — verifies all 53 public endpoints end-to-end

---

## Phase 3 — Auth Service (`packages/auth-service/` :3001)

### Setup
- [x] `app.ts`, `server.ts`, `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json`

### Domain
- [x] (no domain entities — delegates to Firebase Auth)

### Use Cases
- [x] `RegisterUseCase` — email check → Firebase user → claim → Firestore doc → outbox event
- [x] `LogoutUseCase` — `revokeRefreshTokens(uid)`
- [x] `TrackLoginAttemptsUseCase` — lockout after 10 attempts in 15 min
- [x] `PasswordResetUseCase` — calls Firebase Identity Toolkit REST API

### Endpoints
- [x] `POST /auth/register`
- [x] `POST /auth/logout`
- [x] `POST /auth/password-reset`
- [x] `POST /auth/track-failure` (client reports failed login)

### Tests
- [x] Unit: `RegisterUseCase` (3 cases)
- [x] Unit: `TrackLoginAttemptsUseCase` (4 cases — lockout, reset, fresh)
- [x] Integration: `POST /auth/register` (4 cases)
- [x] Integration: `POST /auth/logout` + `POST /auth/password-reset` (4 cases)

---

## Phase 4 — User Service (`packages/user-service/` :3002)

### Setup
- [x] `app.ts`, `server.ts` (dynamic import fixes Firebase init order), `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json` (rootDir + paths fixed)

### Domain
- [x] `User` entity
- [x] `UserRole` value object (`student`, `admin`, `super_admin`)
- [x] `UserStatus` value object (`pending_approval`, `approved`, `rejected`, `suspended`)
- [x] `IUserRepository` interface

### Infrastructure
- [x] `FirestoreUserRepository` (`findById`, `findByEmail`, `create`, `update`, `findAll`)
- [x] `FirebaseAuthClient` (`createUser`, `setCustomClaims`, `disableUser`, `enableUser`, `updatePassword`, `verifyPassword`)

### Use Cases
- [x] `GetMeUseCase`
- [x] `UpdateProfileUseCase`
- [x] `ChangePasswordUseCase`
- [x] `GetUsersUseCase`
- [x] `GetUserByIdUseCase`
- [x] `SuspendUserUseCase`
- [x] `ReactivateUserUseCase`
- [x] `CreateAdminUseCase`
- [x] `DeleteAdminUseCase`
- [x] `CheckEmailExistsUseCase`
- [x] `ApproveUserUseCase`

### Internal Endpoints
- [x] `POST /internal/users/exists` — email uniqueness check
- [x] `POST /internal/users/approve` — set status = APPROVED
- [x] `GET /internal/users/admins` — returns admin UIDs (used by notification-service)

### Endpoints
- [x] `GET /me`
- [x] `PATCH /me`
- [x] `POST /me/change-password`
- [x] `GET /users` (admin)
- [x] `GET /users/:uid` (admin)
- [x] `POST /users/:uid/suspend` (admin)
- [x] `POST /users/:uid/reactivate` (admin)
- [x] `GET /super-admin/admins` (super_admin)
- [x] `POST /super-admin/admins` (super_admin)
- [x] `GET /super-admin/admins/:uid` (super_admin)
- [x] `POST /super-admin/admins/:uid/suspend` (super_admin)
- [x] `POST /super-admin/admins/:uid/reactivate` (super_admin)
- [x] `DELETE /super-admin/admins/:uid` (super_admin)

### Tests
- [x] Unit: `CreateAdminUseCase` (4 cases)
- [x] Unit: `SuspendUserUseCase` (4 cases)
- [x] Unit: `User` entity (13 cases — pre-existing)
- [x] Integration: `POST /super-admin/admins` (3 cases)
- [x] Integration: `GET /users` (2 cases)

---

## Phase 5 — Course Service (`packages/course-service/` :3003)

### Setup
- [x] `app.ts`, `server.ts`, `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json`

### Domain
- [x] `Course` entity (state machine: `draft → published → archived`)
- [x] `Semester` entity
- [x] `Subject` entity
- [x] `CourseState` type (`draft | published | archived`)
- [x] `YouTubeVideoId` value object (11-char `[A-Za-z0-9_-]` validation)
- [x] `ICourseRepository`, `ISemesterRepository`, `ISubjectRepository` interfaces

### Infrastructure
- [x] `FirestoreCourseRepository` (cursor pagination, soft-delete, `findPublished`, `findAll`)
- [x] `FirestoreSemesterRepository`
- [x] `FirestoreSubjectRepository`
- [x] `firestore.indexes.json` — `courses`, `semesters`, `subjects` composite indexes

### Use Cases
- [x] `CreateCourseUseCase`
- [x] `UpdateCourseUseCase`
- [x] `GetCourseUseCase` (role-aware: DRAFT visible to admin only)
- [x] `PublishCourseUseCase` (validates ≥ 1 semester + every semester has ≥ 1 subject)
- [x] `UnpublishCourseUseCase`
- [x] `ArchiveCourseUseCase`
- [x] `DeleteCourseUseCase` (soft-delete)
- [x] `CreateSemesterUseCase` (increments course.semesterCount)
- [x] `UpdateSemesterUseCase`
- [x] `DeleteSemesterUseCase` (decrements course.semesterCount)
- [x] `CreateSubjectUseCase` (validates YouTubeVideoId, increments semester.subjectCount)
- [x] `UpdateSubjectUseCase`
- [x] `DeleteSubjectUseCase` (decrements semester.subjectCount)
- [x] `GetSubjectCountUseCase` (internal — sums subjectCount across semesters)

### Internal Endpoints
- [x] `GET /internal/courses/:id/subject-count` (used by progress-service)
- [x] `GET /internal/courses/:id/state` (used by enrollment-service)
- [x] `GET /internal/subjects/:id` (used by storage-service)

### Endpoints
- [x] `GET /courses` (public — role-aware filter)
- [x] `GET /courses/:id` (public — 404 for DRAFT if not admin)
- [x] `POST /courses` (admin)
- [x] `PATCH /courses/:id` (admin)
- [x] `POST /courses/:id/publish` (admin)
- [x] `POST /courses/:id/unpublish` (admin)
- [x] `POST /courses/:id/archive` (admin)
- [x] `DELETE /courses/:id` (admin)
- [x] `POST /courses/:id/semesters` (admin)
- [x] `PATCH /semesters/:id` (admin)
- [x] `DELETE /semesters/:id` (admin)
- [x] `POST /semesters/:id/subjects` (admin)
- [x] `PATCH /subjects/:id` (admin)
- [x] `DELETE /subjects/:id` (admin)

### Tests
- [x] Unit: `PublishCourseUseCase` (5 cases — success, 404, no semesters, empty semester, already published)
- [x] Unit: `ArchiveCourseUseCase` (3 cases)
- [x] Unit: `UnpublishCourseUseCase` (3 cases)
- [x] Unit: `DeleteCourseUseCase` (2 cases)
- [x] Unit: `CreateSemesterUseCase` (2 cases)
- [x] Unit: `CreateSubjectUseCase` (3 cases — success, invalid YouTube ID, 404)
- [x] Unit: `YouTubeVideoId` value object (8 cases)
- [x] Integration: `POST /courses/:id/publish` (4 cases)
- [x] Integration: `GET /courses` + `GET /courses/:id` (4 cases)

---

## Phase 6 — Enrollment Service (`packages/enrollment-service/` :3004)

### Setup
- [x] `app.ts`, `server.ts`, `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json`

### Domain
- [x] `Registration` entity (`registrations` collection, id=studentUid)
- [x] `Enrollment` entity (`enrollments` collection, id=`${studentUid}_${courseId}`)
- [x] `IRegistrationRepository`, `IEnrollmentRepository` interfaces

### Infrastructure
- [x] `FirestoreRegistrationRepository`
- [x] `FirestoreEnrollmentRepository` (composite key `${studentUid}_${courseId}`)
- [x] `firestore.indexes.json` — `registrations`, `enrollments` composite indexes

### Inter-Service Clients
- [x] `UserServiceClient` — `POST /internal/users/approve`
- [x] `CourseServiceClient` — `GET /internal/courses/:id/state`

### Use Cases
- [x] `CreateRegistrationUseCase`
- [x] `CreateEnrollmentUseCase` (PENDING check, APPROVED check, cooloff check, course published check)
- [x] `ApproveRegistrationUseCase` → calls user-service + outbox event
- [x] `RejectRegistrationUseCase`
- [x] `BulkApproveRegistrationsUseCase` (`Promise.allSettled`)
- [x] `ApproveEnrollmentUseCase`
- [x] `RejectEnrollmentUseCase` (sets `rejectedAt` for cooloff)
- [x] `WithdrawEnrollmentUseCase`

### Internal Endpoints
- [x] `POST /internal/enrollments/registrations` (called by auth-service)
- [x] `GET /internal/enrollments/status` (enrollment check for storage-service)

### Endpoints
- [x] `POST /courses/:id/enroll` (student)
- [x] `GET /me/enrollments` (student)
- [x] `POST /enrollments/:id/withdraw` (student)
- [x] `GET /admin/registrations` (admin)
- [x] `POST /admin/registrations/:id/approve` (admin)
- [x] `POST /admin/registrations/:id/reject` (admin)
- [x] `POST /admin/registrations/bulk-approve` (admin)
- [x] `GET /admin/enrollments` (admin)
- [x] `POST /admin/enrollments/:id/approve` (admin)
- [x] `POST /admin/enrollments/:id/reject` (admin)

### Tests
- [x] Unit: `CreateEnrollmentUseCase` (5 cases — success, 404, PENDING, APPROVED, cooloff)
- [x] Unit: `BulkApproveRegistrationsUseCase` (3 cases — all pass, partial, all fail)
- [x] Unit: `RejectEnrollmentUseCase` (3 cases — success, 404, INVALID_STATE)
- [x] Unit: `WithdrawEnrollmentUseCase` (3 cases — success, 404, INVALID_STATE)
- [x] Integration: `POST /courses/:id/enroll` (4 cases)
- [x] Integration: `POST /admin/registrations/bulk-approve` (partial success)

---

## Phase 7 — Progress Service (`packages/progress-service/` :3005)

### Setup
- [x] `app.ts`, `server.ts`, `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json`

### Domain
- [x] `SubjectProgress` entity (id=`${studentUid}_${subjectId}`, `completedAt` immutable)
- [x] `IProgressRepository` interface (`upsert` preserves `completedAt`)

### Infrastructure
- [x] `FirestoreProgressRepository` — `upsert` never overwrites `completedAt`
- [x] `firestore.indexes.json` — `progress` composite indexes

### Inter-Service Clients
- [x] `CourseServiceClient` — `GET /internal/courses/:id/subject-count`

### Use Cases
- [x] `MarkSubjectCompleteUseCase` — idempotent; second call returns unchanged record without write
- [x] `UpdateLastAccessedUseCase`
- [x] `ComputeCourseProgressUseCase` — `Math.round(x * 1000) / 10` for 1-decimal precision; 0 when total=0
- [x] `ResetProgressUseCase` — deletes all records, publishes `audit.action` event
- [x] `GetSubjectProgressUseCase`

### Internal Endpoints
- [x] `POST /internal/progress/reset`

### Endpoints
- [x] `POST /progress/subjects/:id/complete` (student)
- [x] `POST /progress/subjects/:id/access` (student)
- [x] `GET /me/progress/courses/:courseId` (student)
- [x] `GET /me/progress/subjects/:subjectId` (student)
- [x] `GET /admin/progress/courses/:courseId` (admin)

### Tests
- [x] Unit: `MarkSubjectCompleteUseCase` (3 cases — new, idempotent, in_progress)
- [x] Unit: `ComputeCourseProgressUseCase` (5 cases — 0%, 33.3%, 100%, zero-total, lastAccessed)
- [x] Unit: `UpdateLastAccessedUseCase` (3 cases)
- [x] Integration: `POST /progress/subjects/:id/complete` (idempotency proven)
- [x] Integration: `GET /me/progress/courses/:courseId`

---

## Phase 8 — Storage Service (`packages/storage-service/` :3006)

### Setup
- [x] `app.ts`, `server.ts`, `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json`

### Infrastructure
- [x] `CloudStorageRepository` (upload, getSignedUrl, delete)
- [x] `FirestoreAttachmentRepository`
- [x] `CourseServiceClient` — verify subject exists via `GET /internal/subjects/:id`
- [x] `EnrollmentServiceClient` — verify enrollment via `GET /internal/enrollments/status`

### Middleware
- [x] `handleAttachmentUpload` (multer) — PDF/DOC/DOCX only, 25 MB limit, 415/413 on violation

### Use Cases
- [x] `UploadAttachmentUseCase` — verify subject, upload, persist metadata
- [x] `GetDownloadUrlUseCase` — 15-min signed URL; enrollment check for students; no check for admins
- [x] `DeleteAttachmentUseCase`

### Endpoints
- [x] `POST /subjects/:id/attachments` (admin)
- [x] `GET /attachments/:id/download-url` (student enrolled, admin)
- [x] `DELETE /attachments/:id` (admin)

### Tests
- [x] Unit: `UploadAttachmentUseCase` (2 cases — success, subject not found)
- [x] Unit: `GetDownloadUrlUseCase` (4 cases — enrolled, non-enrolled, admin, 404)
- [x] Smoke test: all 3 storage endpoints verified working with Storage emulator (upload 201, download-url 200, delete 204)
- [ ] Integration: `POST /subjects/:id/attachments` Jest test (formal test file not yet written)

---

## Phase 9 — Notification Service (`packages/notification-service/` :3007)

### Setup
- [x] `app.ts`, `server.ts`, `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json`

### Domain
- [x] `Notification` entity
- [x] `INotificationRepository` interface

### Infrastructure
- [x] `FirestoreNotificationRepository` (`markAllRead` uses batch write)
- [x] `EmailClient` (SendGrid `@sendgrid/mail`)
- [x] `FcmClient` (Firebase Cloud Messaging)
- [x] `UserServiceClient` — `GET /internal/users/admins` (for admin notifications)
- [x] `firestore.indexes.json` — `notifications` composite indexes

### Services
- [x] `NotificationDispatcher` — email (3 retries: 1s/2s/4s backoff, never throws) + push (best-effort, never throws)

### Event Handlers (all wired to `POST /internal/events`)
- [x] `RegistrationApprovedHandler` — in-app + email
- [x] `RegistrationRejectedHandler` — in-app + email
- [x] `EnrollmentPendingHandler` — in-app to all admins (via UserServiceClient)
- [x] `EnrollmentApprovedHandler` — in-app + email + push (best-effort)
- [x] `EnrollmentRejectedHandler` — in-app + email
- [x] `UserRegisteredHandler` — in-app to all admins
- [x] `AdminSuspendedHandler` — in-app + email

### Internal
- [x] `POST /internal/events` — receives event from outbox worker, routes to handler

### Endpoints
- [x] `GET /me/notifications` (any authenticated, filterable by `read`)
- [x] `POST /me/notifications/:id/read` (any authenticated)
- [x] `POST /me/notifications/read-all` (any authenticated, returns 204)

### Tests
- [x] Unit: `NotificationDispatcher` (3 cases — success, 3×retry→error logged, push→warn logged)
- [x] Unit: `RegistrationApprovedHandler` (2 cases)
- [x] Unit: `EnrollmentApprovedHandler` (2 cases — all channels, push failure safe)
- [x] Unit: `EnrollmentPendingHandler` (2 cases — notifies all admins, empty admin list)
- [x] Integration: list notifications + filter by read + mark read + mark all read (7 cases)

---

## Phase 10 — Audit Service (`packages/audit-service/` :3008)

### Setup
- [x] `app.ts`, `server.ts`, `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json`

### Infrastructure
- [x] `FirestoreAuditRepository` — `append` uses `db.collection.add()` (auto-ID), no update/delete
- [x] `firestore.indexes.json` — `audit_log` + `outbox` composite indexes

### Event Handlers
- [x] `AuditEventHandler` — handles ALL event types (records action; `audit.action` uses payload fields)
- [x] `POST /internal/events` — receives events from outbox worker

### Endpoints
- [x] `GET /audit-log` (super_admin, filterable by actorUid/action/targetType/targetId/from/to, cursor paginated)

### Firestore Security Rules
- [x] `audit_log` — reads: super_admin only; writes/updates/deletes: denied (in `firestore.rules`)
- [x] Security Rules unit tests (`tests/rules/auditLog.rules.test.ts` — 9 cases)

### Tests
- [x] Unit: `AuditEventHandler` (2 cases — correct fields, null actorUid)
- [x] Integration: `GET /audit-log` (5 cases — list, filter, pagination, 403, 401)
- [x] Integration: `POST /internal/events` (2 cases — stores record, 401)

---

## Phase 11 — Outbox Worker (`packages/outbox-worker/` :3009)

### Setup
- [x] `worker.ts`, `config.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json`

### Implementation
- [x] `EventDispatcher` — routes `eventType` to correct handlers (per-event multi-target dispatch)
- [x] `processEvent` — extracted to testable module; mark processing → dispatch → delivered/retry/failed
- [x] Poll `outbox` every `OUTBOX_POLL_INTERVAL_SECONDS` (default 5s) using `setInterval`
- [x] Batch size: `OUTBOX_BATCH_SIZE` (default 20) per tick
- [x] Mark `processing` before dispatch (prevents double-dispatch on restart)
- [x] Mark `delivered` + `processedAt` on success
- [x] Increment `attempts`; mark `failed` with error message after 5 attempts
- [x] `Promise.allSettled` — one event failure never blocks other events

### Registered Event Types
- [x] `user.registered` → notify + audit
- [x] `registration.approved` → user (approve) + notify + audit
- [x] `registration.rejected` → notify + audit
- [x] `enrollment.pending` → notify + audit
- [x] `enrollment.approved` → notify + audit
- [x] `enrollment.rejected` → notify + audit
- [x] `enrollment.withdrawn` → audit
- [x] `course.published` → notify + audit
- [x] `progress.subjectCompleted` → audit
- [x] `admin.created` → audit
- [x] `admin.suspended` → notify + audit
- [x] `audit.action` → audit

### Tests
- [x] Unit: `EventDispatcher` (4 cases — known event, unknown event, audit.action, registration.approved multi-target)
- [x] Unit: `processEvent` retry logic (4 cases — delivered, pending on 1st fail, failed on 5th, never throws)

---

## Phase 12 — Firestore Composite Indexes

- [x] `users` — 4 composite indexes (deletedAt + role/status + createdAt)
- [x] `courses` — 3 composite indexes (state + publishedAt + deletedAt)
- [x] `semesters` — courseId + deletedAt + order
- [x] `subjects` — semesterId/courseId + deletedAt + order
- [x] `registrations` — state + createdAt
- [x] `enrollments` — 2 composite indexes (studentUid + state, state + courseId + createdAt)
- [x] `progress` — 2 composite indexes (studentUid + courseId + state, courseId + studentUid)
- [x] `notifications` — 2 composite indexes (userUid + createdAt, userUid + read + createdAt)
- [x] `audit_log` — 2 composite indexes (actorUid + createdAt, action + createdAt)
- [x] `outbox` — status + createdAt
- [ ] All indexes deployed to Firebase project (`npx firebase deploy --only firestore:indexes`)

---

## Phase 13 — CI/CD Pipeline

- [x] `.github/workflows/ci.yml` — matrix strategy across all 10 services
- [x] Type-check step
- [x] Lint step
- [x] Unit test step with coverage
- [ ] Integration test step (Firestore emulator in CI) — pending integration tests
- [x] `npm audit` step (flag HIGH/CRITICAL)
- [x] Docker build step
- [x] Trivy image scan step (fail on HIGH/CRITICAL CVEs)
- [x] Push image to registry (main branch only)
- [x] Deploy to staging (main branch)
- [x] Deploy to production (version tags `v*` with manual approval)
- [x] Firebase rules + indexes deploy job

## Kubernetes Manifests

- [x] `k8s/<service>/deployment.yaml` — all 10 services, liveness + readiness probes, preStop
- [x] `k8s/<service>/service.yaml` — ClusterIP for all HTTP services
- [x] `k8s/<service>/hpa.yaml` — min 2 / max 10 replicas, CPU 70% target
- [x] `k8s/gateway/ingress.yaml` — TLS termination, routes `/api/v1/*` to gateway

## Firestore Security Rules

- [x] `audit_log` — reads: super_admin only; writes/updates/deletes: denied
- [x] `outbox` — no client access
- [x] `users` — reads: owner or admin; writes: denied
- [x] `courses` — reads: published+non-deleted for public, all for admin; writes: denied
- [x] `enrollments`, `progress`, `notifications` — scoped by owner or admin
- [x] All other collections — default deny
- [x] `storage.rules` — all client access denied (signed URLs via Admin SDK only)
- [x] Security Rules unit tests (`tests/rules/auditLog.rules.test.ts`)

## E2E Smoke Tests

- [x] `tests/e2e/smoke.test.ts` — 6 smoke tests: healthz, readyz, courses public, register validation, unauthenticated 401, rate limiter 429
- [x] `scripts/smoke-test.js` — full 53-endpoint smoke test (all services, all roles) — **53/53 passing** ✅ *(re-verified 2026-05-13 against online Firebase)*

## Documentation

- [x] `CLAUDE.md` — codebase guidance for Claude Code (architecture, patterns, commands)
- [x] `SUMMARY.md` — full project summary (all services, API, data model, setup guide)
- [x] `.claude/APIdocument/API_Document.md` — full REST API reference; audited and synced against actual code (24 discrepancies fixed; sections 13.2–20 completed: user mgmt, admin mgmt, audit log, health, data models, error codes, HTTP status codes, domain events)

---

## Progress Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup | `[x]` |
| 1 | Shared Packages | `[x]` |
| 2 | API Gateway | `[x]` |
| 3 | Auth Service | `[x]` |
| 4 | User Service | `[x]` |
| 5 | Course Service | `[x]` |
| 6 | Enrollment Service | `[x]` |
| 7 | Progress Service | `[x]` |
| 8 | Storage Service | `[x]` |
| 9 | Notification Service | `[x]` |
| 10 | Audit Service | `[x]` |
| 11 | Outbox Worker | `[x]` |
| 12 | Firestore Indexes | `[~]` |
| 13 | CI/CD Pipeline | `[x]` |

---

*© 2026 Future CX Lanka (Pvt) Ltd — Confidential*
