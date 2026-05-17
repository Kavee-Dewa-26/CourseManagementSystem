# CMP Backend — Implementation Tracker

**Project:** Course Management Portal (`slp-backend`)  
**Organisation:** Future CX Lanka (Pvt) Ltd  
**Version:** 1.0.0  
**Last Updated:** 2026-05-16 (V2 batch management + role requests implemented; enrollment-service Dockerfile recreated; auth bugs fixed; 21 Batch unit tests added; CLAUDE.md corrections; tracker updated with all V2 progress)

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
- [x] `AddRoleUseCase` — appends a role to `user.roles[]` array; used by `ApproveRoleRequestUseCase` (V2)
- [x] `UploadAvatarUseCase` — saves to Firebase Storage under `avatars/{uid}.{ext}`, calls `makePublic()`, stores `profilePhotoUrl` (V2)

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
- [x] `POST /super-admin/users/:uid/make-admin` (super_admin) — promote member/student to admin
- [x] `POST /me/avatar` (any authenticated) — multipart upload, image/jpeg + image/png, max 2 MB

### Tests
- [x] Unit: `CreateAdminUseCase` (4 cases)
- [x] Unit: `SuspendUserUseCase` (4 cases)
- [x] Unit: `User` entity (13 cases — pre-existing)
- [x] Unit: `AddRoleUseCase`, `UploadAvatarUseCase`, `GetMeUseCase`, `GetUserByIdUseCase`, `GetUsersUseCase`, `ChangePasswordUseCase`, `CheckEmailExistsUseCase`, `DeleteAdminUseCase`, `ReactivateUserUseCase`, `UpdateProfileUseCase`, `ApproveUserUseCase`, `PromoteToAdminUseCase` (V2 expanded suite)
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
- [x] `FirestoreBatchRepository` (`findById`, `findByCourseId`, `create`, `update`) (V2)
- [x] `TtlCache<T>` — in-process 30 s list cache at `src/infrastructure/cache/TtlCache.ts`
- [x] `firestore.indexes.json` — `courses`, `semesters`, `subjects`, `batches` composite indexes

### Use Cases
- [x] `CreateCourseUseCase`
- [x] `UpdateCourseUseCase`
- [x] `GetCourseUseCase` (role-aware: DRAFT visible to admin only)
- [x] `PublishCourseUseCase` (validates ≥ 1 semester + every semester has ≥ 1 subject)
- [x] `UnpublishCourseUseCase`
- [x] `ArchiveCourseUseCase`
- [x] `RestoreCourseUseCase` — archived → draft (V2)
- [x] `DeleteCourseUseCase` (soft-delete)
- [x] `CreateSemesterUseCase` (increments course.semesterCount)
- [x] `UpdateSemesterUseCase`
- [x] `DeleteSemesterUseCase` (decrements course.semesterCount)
- [x] `CreateSubjectUseCase` (validates YouTubeVideoId, increments semester.subjectCount)
- [x] `UpdateSubjectUseCase`
- [x] `DeleteSubjectUseCase` (decrements semester.subjectCount)
- [x] `GetSubjectCountUseCase` (internal — sums subjectCount across semesters)
- [x] `CreateBatchUseCase` — auto-opens if `scheduledOpenAt` is in the past (V2)
- [x] `GetBatchesUseCase` (V2)
- [x] `GetBatchUseCase` (V2)
- [x] `UpdateBatchUseCase` — blocks date changes on non-draft batches (V2)
- [x] `OpenBatchUseCase` — draft → open (V2)
- [x] `CloseBatchUseCase` — open → closed (V2)

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
- [x] `POST /courses/:id/restore` (admin) (V2)
- [x] `DELETE /courses/:id` (admin)
- [x] `POST /courses/:id/semesters` (admin)
- [x] `PATCH /semesters/:id` (admin)
- [x] `DELETE /semesters/:id` (admin)
- [x] `POST /semesters/:id/subjects` (admin)
- [x] `PATCH /subjects/:id` (admin)
- [x] `DELETE /subjects/:id` (admin)
- [x] `GET /courses/:id/batches` (public) (V2)
- [x] `POST /courses/:id/batches` (admin) (V2)
- [x] `GET /batches/:id` (public) (V2)
- [x] `PATCH /batches/:id` (admin) (V2)
- [x] `POST /batches/:id/open` (admin) (V2)
- [x] `POST /batches/:id/close` (admin) (V2)

### Tests
- [x] Unit: `PublishCourseUseCase` (5 cases — success, 404, no semesters, empty semester, already published)
- [x] Unit: `ArchiveCourseUseCase` (3 cases)
- [x] Unit: `UnpublishCourseUseCase` (3 cases)
- [x] Unit: `RestoreCourseUseCase` (V2)
- [x] Unit: `DeleteCourseUseCase` (2 cases)
- [x] Unit: `CreateSemesterUseCase` (2 cases)
- [x] Unit: `CreateSubjectUseCase` (3 cases — success, invalid YouTube ID, 404)
- [x] Unit: `YouTubeVideoId` value object (8 cases)
- [x] Unit: `CreateBatchUseCase` (4 cases — draft, future scheduledOpenAt, past scheduledOpenAt, 404) (V2)
- [x] Unit: `UpdateBatchUseCase` (5 cases — name update, date on draft, 404, 409 open, 409 closed) (V2)
- [x] Unit: `GetBatchUseCase` (2 cases) (V2)
- [x] Unit: `GetBatchesUseCase` (2 cases) (V2)
- [x] Unit: `OpenBatchUseCase` (4 cases — success, 404, 409 already open, 409 closed) (V2)
- [x] Unit: `CloseBatchUseCase` (4 cases — success, 404, 409 draft, 409 already closed) (V2)
- [x] Integration: `POST /courses/:id/publish` (4 cases)
- [x] Integration: `GET /courses` + `GET /courses/:id` (4 cases)

---

## Phase 6 — Enrollment Service (`packages/enrollment-service/` :3004)

### Setup
- [x] `app.ts`, `server.ts`, `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json` — Dockerfile was deleted during V2 work and recreated 2026-05-16

### Domain
- [x] `Registration` entity (`registrations` collection, id=studentUid)
- [x] `Enrollment` entity (`enrollments` collection, id=`${studentUid}_${courseId}`)
- [x] `IRegistrationRepository`, `IEnrollmentRepository` interfaces
- [x] `RoleRequest` entity (`role_requests` collection, auto UUID) (V2)
- [x] `IRoleRequestRepository` interface (V2)

### Infrastructure
- [x] `FirestoreRegistrationRepository`
- [x] `FirestoreEnrollmentRepository` (composite key `${studentUid}_${courseId}`)
- [x] `FirestoreRoleRequestRepository` (V2)
- [x] `firestore.indexes.json` — `registrations`, `enrollments`, `role_requests` composite indexes

### Inter-Service Clients
- [x] `UserServiceClient` — `POST /internal/users/approve`, `PATCH /internal/users/:uid/roles` (V2)
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
- [x] `CreateRoleRequestUseCase` — member requests student role (V2)
- [x] `ApproveRoleRequestUseCase` — grants role via user-service + outbox event (V2)
- [x] `RejectRoleRequestUseCase` — rejects with optional note (V2)
- [x] `GetRoleRequestsUseCase` — admin list with status filter + cursor pagination (V2)
- [x] `GetMyRoleRequestsUseCase` — member's own requests (V2)

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
- [x] `POST /role-requests` (any authenticated) (V2)
- [x] `GET /role-requests/mine` (any authenticated) (V2)
- [x] `GET /role-requests` (admin) (V2)
- [x] `POST /role-requests/:id/approve` (admin) (V2)
- [x] `POST /role-requests/:id/reject` (admin) (V2)

### Tests
- [x] Unit: `CreateEnrollmentUseCase` (5 cases — success, 404, PENDING, APPROVED, cooloff)
- [x] Unit: `BulkApproveRegistrationsUseCase` (3 cases — all pass, partial, all fail)
- [x] Unit: `RejectEnrollmentUseCase` (3 cases — success, 404, INVALID_STATE)
- [x] Unit: `WithdrawEnrollmentUseCase` (3 cases — success, 404, INVALID_STATE)
- [x] Unit: `ApproveRegistrationUseCase`, `CreateRegistrationUseCase`, `RejectRegistrationUseCase`, `ApproveEnrollmentUseCase` (V2 expanded suite)
- [x] Unit: `CreateRoleRequestUseCase` (4 cases — success, 409 duplicate, outbox event, unique IDs)
- [x] Unit: `ApproveRoleRequestUseCase` (6 cases — success, no note, 404, 409 approved, 409 rejected, user-service failure)
- [x] Unit: `RejectRoleRequestUseCase` (5 cases — success, no note, 404, 409 rejected, 409 approved)
- [x] Unit: `GetRoleRequestsUseCase` (5 cases — list, status filter, cursor, empty, nextCursor)
- [x] Unit: `GetMyRoleRequestsUseCase` (4 cases — list, empty, correct UID, all statuses)
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
- [x] Integration test step (Firestore emulator in CI) — 99 integration tests across 13 suites passing
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

## Phase 14 — V2 Bug Fixes & Hardening

- [x] `POST /auth/logout` — fixed `authorize()` to include `member`, `leader`, `g12`; V2 members could not log out
- [x] `GET /subjects/:id/lessons` — fixed `authorize()` to include `leader`, `g12`; V2 roles could not access lessons
- [x] `packages/enrollment-service/Dockerfile` — recreated after accidental deletion; docker-compose build was broken
- [x] Role Request unit tests — `CreateRoleRequestUseCase`, `ApproveRoleRequestUseCase`, `RejectRoleRequestUseCase`, `GetRoleRequestsUseCase`, `GetMyRoleRequestsUseCase`
- [x] Storage Service: `POST /subjects/:id/images` — new endpoint; `handleImageUpload` middleware (PNG/JPEG only, 10 MB); gateway route added; 7 integration tests
- [x] User Service: `POST /me/fcm-token` endpoint (V2 device registration for push) — implemented + 4 integration tests
- [x] User Service: `PATCH /users/:uid/roles` endpoint (V2 admin role assignment) — implemented + 16 unit + 10 integration tests; fixed RegisterFcmTokenUseCase idempotency bug
- [x] Audit Service: `GET /users/:uid/audit-log` per-user timeline — new route; admin + super_admin access; gateway route added; 8 integration tests; updated auditLog.test.ts for V2 RBAC

---

## Progress Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup | `[x]` |
| 1 | Shared Packages | `[x]` |
| 2 | API Gateway | `[x]` |
| 3 | Auth Service | `[x]` |
| 4 | User Service | `[x]` |
| 5 | Course Service — incl. V2 Batches | `[x]` |
| 6 | Enrollment Service — incl. V2 Role Requests | `[x]` |
| 7 | Progress Service | `[x]` |
| 8 | Storage Service | `[x]` |
| 9 | Notification Service | `[x]` |
| 10 | Audit Service | `[x]` |
| 11 | Outbox Worker | `[x]` |
| 12 | Firestore Indexes | `[~]` |
| 13 | CI/CD Pipeline | `[x]` |
| 14 | V2 Bug Fixes & Hardening | `[x]` |
| 15 | Cell Service (:3010) | `[x]` |
| 16 | Analytics Service (:3011) | `[x]` |
| 17 | Small API Completions + Migration Scripts | `[x]` |
| 18 | Scheduled Jobs (:3012) | `[x]` |
| 19 | Google/Apple OAuth + Provider Linking | `[x]` |

---

## Phase 18 — Scheduled Jobs (`packages/scheduled-jobs/` no HTTP port)

### Setup
- [x] `worker.ts` — entry point; initialises Firebase, starts 3 setInterval loops
- [x] `config.ts` — configurable intervals + snapshot weekday/hour via env vars
- [x] `Dockerfile` — multi-stage build; no HTTP server (CMD: node dist/worker.js)
- [x] `docker-compose.yml` — scheduled-jobs service entry

### Jobs
- [x] **`batchSweepJob`** — opens DRAFT batches when `scheduledOpenAt <= now`; closes OPEN batches when `intakeEnd < today`; publishes `audit.action` outbox events
- [x] **`semesterSweepJob`** — disables semesters whose `endDate < today`; skips null endDate; runs daily (first check of each new day)
- [x] **`snapshotJob`** — aggregates cell reports per scope (leader/g12/org); writes `analytics_snapshots` documents; runs weekly on configured weekday+hour

### Design notes
- Direct Firestore reads (same pattern as outbox-worker — background workers are exempt from cross-service HTTP rule)
- All jobs wrapped in `safeRun()` — failures are logged and don't crash the worker
- Batch sweep runs once on startup to catch missed windows from downtime
- Snapshot deduped by weekKey — won't overwrite same week twice per process lifecycle

### Tests
- [x] Unit: `batchSweepJob` (4 cases — open, close, no-op, null scheduledOpenAt guard)
- [x] Unit: `semesterSweepJob` (4 cases — disable, no-op, null endDate, multiple)
- [x] Unit: `snapshotJob` (3 cases — full cycle, empty cells, voided reports)

---

## Phase 17 — Small API Completions & Migration Scripts

### User Service — 2 new endpoints
- [x] `DELETE /me/fcm-token` — DeregisterFcmTokenUseCase (idempotent); route + controller + 3 unit + 4 integration tests
- [x] `PATCH /me/notifications/preferences` — UpdateNotificationPreferencesUseCase; route + controller + 5 unit + 6 integration tests
- [x] Fixed `FirestoreUserRepository.toUser()` — was not reading `notificationPreferences` from Firestore (bug found during integration testing)
- [x] Extended `User` entity — added `notificationPreferences: { email, push }` field + `deregisterFcmToken()` + `updateNotificationPreferences()` methods

### Migration Scripts
- [x] `005-legacy-batches.js` — creates `Legacy (Pre-V2)` batch per course; backfills `enrollments.batchId`; idempotent
- [x] `006-semester-dates.js` — sets `openDate = createdAt`, `endDate = null` on all existing semesters; idempotent

---

## Phase 15 — Cell Service (`packages/cell-service/` :3010)

### Setup
- [x] `app.ts`, `server.ts`, `config.ts`, `container.ts`
- [x] `Dockerfile`, `package.json`, `tsconfig.json`
- [x] Gateway: `/api/v1/cells/*` → cellProxy; `/api/v1/subjects/:id/images` → storageProxy; `/api/v1/users/:uid/audit-log` → auditProxy

### Domain
- [x] `CellGroup` entity — `isOwnedBy()`, `hasMember()`, `addMembers()`, `removeMember()`, `update()`, `archive()`, `incrementReportCount()`
- [x] `JoinRequest` entity — `approve()`, `reject()` state machine
- [x] `CellReport` entity — `void()` with REPORT_ALREADY_VOIDED guard
- [x] `ICellGroupRepository`, `IJoinRequestRepository`, `ICellReportRepository` interfaces

### Infrastructure
- [x] `FirestoreCellGroupRepository` — root `cell_groups` collection; `findByMember()` uses `array-contains`
- [x] `FirestoreJoinRequestRepository` — sub-collection `cell_groups/{id}/join_requests`
- [x] `FirestoreCellReportRepository` — sub-collection `cell_groups/{id}/cell_reports`; idempotency via `clientReqId` index

### Use Cases (16 total)
- [x] `CreateCellGroupUseCase` — adds leader as first member; publishes `cell.created`
- [x] `GetCellsUseCase` — role-scoped (leader→own cells, member→all active, admin→all)
- [x] `GetMyCellsUseCase` — `array-contains` query on members[]
- [x] `GetCellByIdUseCase` — 403 if not member/owner/admin
- [x] `UpdateCellGroupUseCase` — owner or admin only
- [x] `ArchiveCellGroupUseCase` — owner or admin; 409 if already archived
- [x] `AddMembersUseCase` — owner or admin; idempotent (skips existing members)
- [x] `RemoveMemberUseCase` — owner or admin; 404 if not a member
- [x] `CreateJoinRequestUseCase` — member/student; 409 CELL_JOIN_REQUEST_PENDING if duplicate; publishes `cell.join_requested`
- [x] `GetJoinRequestsUseCase` — owner or admin; defaults status=pending
- [x] `ApproveJoinRequestUseCase` — admin only; adds member atomically; publishes `cell.join_approved`
- [x] `RejectJoinRequestUseCase` — admin only; publishes `cell.join_rejected`
- [x] `FileReportUseCase` — owning leader/G12 or super_admin; idempotency via X-Idempotency-Key; increments reportCount; publishes `cell_report.filed`
- [x] `GetReportsUseCase` — member/owner/admin
- [x] `GetReportByIdUseCase` — member/owner/admin
- [x] `VoidReportUseCase` — owner or admin; 409 REPORT_ALREADY_VOIDED; publishes `cell_report.voided`

### Endpoints (16 total)
- [x] `GET /cells`, `GET /cells/mine`, `POST /cells`, `GET /cells/:id`, `PATCH /cells/:id`, `POST /cells/:id/archive`
- [x] `POST /cells/:id/members`, `DELETE /cells/:id/members/:uid`
- [x] `POST /cells/:id/join-requests`, `GET /cells/:id/join-requests`, `POST /cells/:id/join-requests/:rid/approve`, `POST /cells/:id/join-requests/:rid/reject`
- [x] `GET /cells/:id/reports`, `POST /cells/:id/reports` (idempotent), `GET /cells/:id/reports/:rid`, `POST /cells/:id/reports/:rid/void`

### Tests
- [x] Unit: `CellGroup` entity (14 cases — isOwnedBy, hasMember, addMembers, removeMember, archive, incrementReportCount)
- [x] Unit: `JoinRequest` entity (4 cases — approve, reject, state guards)
- [x] Unit: `CellReport` entity (2 cases — void, already voided)
- [x] Unit: `CreateCellGroupUseCase` (2 cases — create, unique IDs)
- [x] Unit: `ArchiveCellGroupUseCase` (5 cases — owner, admin, 404, 403, 409)
- [x] Unit: `ApproveJoinRequestUseCase` (4 cases — approve, 404 cell, 404 request, 409)
- [x] Unit: `FileReportUseCase` (5 cases — new, idempotent, admin forbidden, 404, super_admin allowed)
- [x] Unit: `VoidReportUseCase` (4 cases — void, already voided, 404, 403 member)
- [x] Integration: `cells.test.ts` — 38 cases covering all 16 endpoints with RBAC, 404, 409, idempotency

---

*© 2026 Future CX Lanka (Pvt) Ltd — Confidential*
