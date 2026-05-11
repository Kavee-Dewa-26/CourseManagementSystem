# CMP API Summary

**Base URL:** `http://localhost:3000/api/v1` (local) · `https://api.yourdomain.com/api/v1` (prod)  
**Auth:** `Authorization: Bearer <firebase-id-token>` on all authenticated endpoints  
**Content-Type:** `application/json` on POST/PATCH with body  
**Correlation:** `X-Request-Id: <uuid-v4>` (optional; server generates if absent, echoed in response)

---

## Endpoint Index

All 54 public API endpoints are implemented and registered. Verified by auditing every route file across all 8 microservices (2026-05-11).

| # | Method | Path | Service | Status |
|---|--------|------|---------|:------:|
| **Auth** | | | auth-service | |
| 2.1 | POST | `/auth/register` | auth-service | ✅ |
| 2.2 | POST | `/auth/logout` | auth-service | ✅ |
| 2.3 | POST | `/auth/password-reset` | auth-service | ✅ |
| **Profile** | | | user-service | |
| 3.1 | GET | `/me` | user-service | ✅ |
| 3.2 | PATCH | `/me` | user-service | ✅ |
| 3.3 | POST | `/me/change-password` | user-service | ✅ |
| **Courses** | | | course-service | |
| 4.1 | GET | `/courses` | course-service | ✅ |
| 4.2 | GET | `/courses/:id` | course-service | ✅ |
| 4.3 | POST | `/courses` | course-service | ✅ |
| 4.4 | PATCH | `/courses/:id` | course-service | ✅ |
| 4.5 | POST | `/courses/:id/publish` | course-service | ✅ |
| 4.6 | POST | `/courses/:id/unpublish` | course-service | ✅ |
| 4.7 | POST | `/courses/:id/archive` | course-service | ✅ |
| 4.8 | DELETE | `/courses/:id` | course-service | ✅ |
| **Semesters** | | | course-service | |
| 5.1 | POST | `/courses/:id/semesters` | course-service | ✅ |
| 5.2 | PATCH | `/semesters/:id` | course-service | ✅ |
| 5.3 | DELETE | `/semesters/:id` | course-service | ✅ |
| **Subjects** | | | course-service | |
| 6.1 | POST | `/semesters/:id/subjects` | course-service | ✅ |
| 6.2 | PATCH | `/subjects/:id` | course-service | ✅ |
| 6.3 | DELETE | `/subjects/:id` | course-service | ✅ |
| **Attachments** | | | storage-service | |
| 7.1 | POST | `/subjects/:id/attachments` | storage-service | ✅ |
| 7.2 | GET | `/attachments/:id/download-url` | storage-service | ✅ |
| 7.3 | DELETE | `/attachments/:id` | storage-service | ✅ |
| **Enrollment — Student** | | | enrollment-service | |
| 8.1 | POST | `/courses/:id/enroll` | enrollment-service | ✅ |
| 8.2 | GET | `/me/enrollments` | enrollment-service | ✅ |
| 8.3 | POST | `/enrollments/:id/withdraw` | enrollment-service | ✅ |
| **Registration Queue — Admin** | | | enrollment-service | |
| 9.1 | GET | `/admin/registrations` | enrollment-service | ✅ |
| 9.2 | POST | `/admin/registrations/:id/approve` | enrollment-service | ✅ |
| 9.3 | POST | `/admin/registrations/:id/reject` | enrollment-service | ✅ |
| 9.4 | POST | `/admin/registrations/bulk-approve` | enrollment-service | ✅ |
| **Enrollment Queue — Admin** | | | enrollment-service | |
| 10.1 | GET | `/admin/enrollments` | enrollment-service | ✅ |
| 10.2 | POST | `/admin/enrollments/:id/approve` | enrollment-service | ✅ |
| 10.3 | POST | `/admin/enrollments/:id/reject` | enrollment-service | ✅ |
| **Progress** | | | progress-service | |
| 11.1 | POST | `/progress/subjects/:id/complete` | progress-service | ✅ |
| 11.2 | POST | `/progress/subjects/:id/access` | progress-service | ✅ |
| 11.3 | GET | `/me/progress/courses/:courseId` | progress-service | ✅ |
| 11.4 | GET | `/me/progress/subjects/:subjectId` | progress-service | ✅ |
| 11.5 | GET | `/admin/progress/courses/:courseId` | progress-service | ✅ |
| **Notifications** | | | notification-service | |
| 12.1 | GET | `/me/notifications` | notification-service | ✅ |
| 12.2 | POST | `/me/notifications/:id/read` | notification-service | ✅ |
| 12.3 | POST | `/me/notifications/read-all` | notification-service | ✅ |
| **User Management** | | | user-service | |
| 13.1 | GET | `/users` | user-service | ✅ |
| 13.2 | GET | `/users/:uid` | user-service | ✅ |
| 13.3 | POST | `/users/:uid/suspend` | user-service | ✅ |
| 13.4 | POST | `/users/:uid/reactivate` | user-service | ✅ |
| **Admin Management** | | | user-service | |
| 14.1 | GET | `/super-admin/admins` | user-service | ✅ |
| 14.2 | POST | `/super-admin/admins` | user-service | ✅ |
| 14.3 | GET | `/super-admin/admins/:uid` | user-service | ✅ |
| 14.4 | POST | `/super-admin/admins/:uid/suspend` | user-service | ✅ |
| 14.5 | POST | `/super-admin/admins/:uid/reactivate` | user-service | ✅ |
| 14.6 | DELETE | `/super-admin/admins/:uid` | user-service | ✅ |
| 14.7 | POST | `/super-admin/users/:uid/make-admin` | user-service | ✅ |
| **Audit Log** | | | audit-service | |
| 15.1 | GET | `/audit-log` | audit-service | ✅ |
| **Health** | | | all services | |
| 16.1 | GET | `/healthz` | all services | ✅ |
| 16.2 | GET | `/readyz` | all services | ✅ |

> `admin` role includes `super_admin` — super_admin inherits all admin permissions.

### Extra endpoint (implemented, not in api.md)

| Method | Path | Service | Notes |
|--------|------|---------|-------|
| POST | `/auth/track-failure` | auth-service | Internal login-attempt tracking; used by the gateway on failed Firebase sign-ins. Not a public-facing endpoint. |

---

## Conventions

### Response shapes

**Single resource**
```json
{ "id": "abc", "title": "...", "createdAt": "2026-05-01T08:00:00.000Z" }
```

**Paginated list**
```json
{ "items": [...], "nextCursor": "abc123", "total": 47 }
```
`nextCursor` is `null` on the last page. Do not send `cursor` on the first request.

**Empty success (DELETE / some POSTs)**
```
HTTP 204 No Content
```

**Error**
```json
{
  "error": { "code": "COURSE_NOT_FOUND", "message": "...", "details": {} },
  "requestId": "7f3a1c2d-..."
}
```
`details` is only present on `400` validation errors (field-level messages).

### Pagination query params

| Param | Type | Default | Max |
|-------|------|:-------:|:---:|
| `limit` | number | 20 | 100 |
| `cursor` | string | — | — |

### Rate limits

| Scope | Limit |
|-------|-------|
| `POST /auth/*` | 10 req / IP / min |
| All other endpoints | 200 req / IP / min |

Exceeded: `429` with `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After` headers.

---

## 2. Auth Endpoints

### 2.1 `POST /auth/register`
Register a new student account. Created in `pending_approval` state.

**Body:**
```json
{
  "firstName": "Viruli",
  "lastName":  "Weerasinghe",
  "email":     "viruli@example.com",
  "password":  "SecurePass@2026"
}
```

| Field | Validation |
|-------|-----------|
| `firstName` / `lastName` | 1–100 chars |
| `email` | Valid email, unique |
| `password` | Min 10 chars · uppercase · lowercase · digit · special char |

**Responses:** `201` message · `400 VALIDATION_ERROR` · `409 EMAIL_EXISTS`

---

### 2.2 `POST /auth/logout`
Revoke all refresh tokens. Existing ID tokens expire naturally (≤ 1 h).

**Responses:** `200 { "message": "Logged out successfully." }` · `401`

---

### 2.3 `POST /auth/password-reset`
Send a password reset email. Always `200` regardless of whether the email exists.

**Body:** `{ "email": "viruli@example.com" }`

**Response:** `200 { "message": "If an account exists..." }`

---

## 3. Profile Endpoints

### 3.1 `GET /me`
**Response:**
```json
{
  "uid": "firebase-uid",
  "email": "viruli@example.com",
  "role": "student",
  "status": "approved",
  "firstName": "Viruli",
  "lastName": "Weerasinghe",
  "profilePhotoUrl": null,
  "createdAt": "2026-05-01T08:00:00.000Z",
  "updatedAt": "2026-05-05T10:30:00.000Z"
}
```

---

### 3.2 `PATCH /me`
Partial update. Only `firstName`, `lastName`, `profilePhotoUrl` may be changed.

**Body (all optional):**
```json
{ "firstName": "Viruli", "lastName": "W.", "profilePhotoUrl": "https://..." }
```

**Responses:** `200` updated user · `400`

---

### 3.3 `POST /me/change-password`
**Body:**
```json
{ "currentPassword": "OldSecurePass@2026", "newPassword": "NewSecurePass@2026" }
```

| Field | Validation |
|-------|-----------|
| `currentPassword` | Required |
| `newPassword` | Min 10 chars · uppercase · lowercase · digit · special char |

**Responses:** `200 { "message": "Password updated successfully." }` · `400` · `401 WRONG_PASSWORD`

---

## 4. Course Endpoints

### 4.1 `GET /courses`
Students/public: published courses only. Admins: all states.

**Query params:** `limit`, `cursor`, `state` (admin: `draft`|`published`|`archived`), `q` (search title)

**Response:** paginated course list (without `semesters` tree)

---

### 4.2 `GET /courses/:id`
Full course with nested `semesters → subjects → attachments`.  
Students/public: `404` if course is not `published`.

**Response (200):**
```json
{
  "id": "course-abc",
  "title": "Introduction to TypeScript",
  "state": "published",
  "coverImageUrl": "https://...",
  "semesterCount": 2,
  "createdBy": "admin-uid",
  "createdByName": "Sapna Nethmini",
  "publishedAt": "2026-05-03T09:00:00.000Z",
  "semesters": [
    {
      "id": "sem-001", "name": "Semester 1", "sortOrder": 1,
      "subjects": [
        {
          "id": "sub-001", "title": "TS Basics",
          "youtubeVideoId": "zQnBQ4tB3ZA", "sortOrder": 1,
          "attachments": [{ "id": "att-001", "fileName": "notes.pdf", "sizeBytes": 204800 }]
        }
      ]
    }
  ]
}
```

**Responses:** `200` · `404 COURSE_NOT_FOUND`

---

### 4.3 `POST /courses`
Create course in `draft` state.

**Body:**
```json
{ "title": "Introduction to TypeScript", "description": "...", "coverImageUrl": null }
```

| Field | Validation |
|-------|-----------|
| `title` | 1–200 chars, unique |
| `description` | 1–5000 chars |
| `coverImageUrl` | HTTPS URL or null |

**Responses:** `201` course · `400` · `409 COURSE_TITLE_EXISTS`

---

### 4.4 `PATCH /courses/:id`
All fields optional. Course must be in `draft` state.

**Body:** `{ "title": "...", "description": "...", "coverImageUrl": "..." }`

**Responses:** `200` · `404`

---

### 4.5 `POST /courses/:id/publish`
Requires ≥ 1 semester and every semester has ≥ 1 subject.

**Responses:** `200` · `409 INVALID_STATE` · `422 NO_SEMESTERS` · `422 EMPTY_SEMESTER`

---

### 4.6 `POST /courses/:id/unpublish`
Published → draft.

**Responses:** `200` · `409 INVALID_STATE`

---

### 4.7 `POST /courses/:id/archive`
Published → archived. Enrolled students keep read-only content access.

**Responses:** `200` · `409 INVALID_STATE`

---

### 4.8 `DELETE /courses/:id`
Soft-delete. Recoverable within 30 days.

**Responses:** `204` · `404`

---

## 5. Semester Endpoints

### 5.1 `POST /courses/:id/semesters`
**Body:**
```json
{ "name": "Semester 1 — Foundations", "sortOrder": 1 }
```

**Responses:** `201` semester · `404 COURSE_NOT_FOUND`

---

### 5.2 `PATCH /semesters/:id`
**Body (optional):** `{ "name": "...", "sortOrder": 2 }`

**Responses:** `200` · `404 SEMESTER_NOT_FOUND`

---

### 5.3 `DELETE /semesters/:id`
Soft-deletes semester and all its subjects.

**Responses:** `204` · `404`

---

## 6. Subject Endpoints

### 6.1 `POST /semesters/:id/subjects`
**Body:**
```json
{
  "title": "TypeScript Basics",
  "description": "Variables, types, interfaces.",
  "youtubeVideoUrl": "https://www.youtube.com/watch?v=zQnBQ4tB3ZA",
  "sortOrder": 1
}
```

Server stores only the 11-char video ID.

**Responses:** `201` subject · `400 INVALID_YOUTUBE_ID` · `404 SEMESTER_NOT_FOUND`

---

### 6.2 `PATCH /subjects/:id`
**Body (all optional):** `title`, `description`, `youtubeVideoUrl`, `sortOrder`

**Responses:** `200` · `404`

---

### 6.3 `DELETE /subjects/:id`
**Responses:** `204` · `404`

---

## 7. Attachment Endpoints

### 7.1 `POST /subjects/:id/attachments`
`Content-Type: multipart/form-data` · Field name: `file`  
Accepted types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`  
Max size: **25 MB**

**Response (201):**
```json
{
  "id": "att-001", "fileName": "notes.pdf",
  "mimeType": "application/pdf", "sizeBytes": 204800,
  "uploadedAt": "2026-05-02T10:00:00.000Z"
}
```

**Responses:** `201` · `415 UNSUPPORTED_MEDIA_TYPE` · `400 FILE_TOO_LARGE`

---

### 7.2 `GET /attachments/:id/download-url`
Returns a signed URL expiring in **15 minutes**. Students need an approved enrollment in the parent course.

**Response (200):**
```json
{ "downloadUrl": "https://storage.googleapis.com/...", "expiresAt": "2026-05-07T10:15:00.000Z" }
```

**Responses:** `200` · `403 ENROLLMENT_REQUIRED` · `404`

---

### 7.3 `DELETE /attachments/:id`
Removes from Cloud Storage and the subject's attachment list.

**Responses:** `204` · `404`

---

## 8. Enrollment — Student

### 8.1 `POST /courses/:id/enroll`
Submit enrollment for a published course. Enters `pending` state.  
Constraints: course must be `published` · student must be `approved` · max 1 active enrollment per course.

**Responses:** `201` enrollment · `409 ENROLLMENT_EXISTS` · `422 COURSE_NOT_PUBLISHED` · `429 RESUBMIT_TOO_EARLY`

---

### 8.2 `GET /me/enrollments`
**Query params:** `state` (`pending`|`approved`|`rejected`|`withdrawn`), `limit`, `cursor`

**Response item:**
```json
{
  "id": "enr-abc", "courseId": "course-abc", "courseTitle": "Introduction to TypeScript",
  "state": "approved", "approvedAt": "2026-05-06T09:00:00.000Z"
}
```

---

### 8.3 `POST /enrollments/:id/withdraw`
Only `pending` enrollments may be withdrawn.

**Responses:** `200` withdrawn · `409 INVALID_STATE`

---

## 9. Registration Queue — Admin

### 9.1 `GET /admin/registrations`
**Query params:** `status` (default `pending`), `q` (name/email search), `limit`, `cursor`

**Response item:**
```json
{
  "id": "reg-001", "studentUid": "uid-abc",
  "firstName": "Viruli", "lastName": "Weerasinghe",
  "email": "viruli@example.com", "status": "pending", "submittedAt": "..."
}
```

---

### 9.2 `POST /admin/registrations/:id/approve`
Sets student account status → `approved`. Sends email + in-app notification to student.

**Response:** `200 { "message": "Registration approved.", "studentUid": "..." }`

**Responses:** `200` · `409 INVALID_STATE`

---

### 9.3 `POST /admin/registrations/:id/reject`
**Body (optional):** `{ "reason": "Incomplete information." }`

**Response:** `200 { "message": "Registration rejected.", "studentUid": "..." }`

---

### 9.4 `POST /admin/registrations/bulk-approve`
Partial success allowed (`Promise.allSettled`). Max 100 IDs per request.

**Body:** `{ "ids": ["reg-001", "reg-002"] }`

**Response:**
```json
{ "approved": ["reg-001"], "failed": [{ "id": "reg-002", "reason": "Already approved." }] }
```

---

## 10. Enrollment Queue — Admin

### 10.1 `GET /admin/enrollments`
**Query params:** `status` (default `pending`), `courseId`, `limit`, `cursor`

---

### 10.2 `POST /admin/enrollments/:id/approve`
Grants student access to course content. Sends in-app + email + push notification.

**Response (200):**
```json
{ "id": "enr-abc", "courseId": "course-abc", "state": "approved", "approvedAt": "..." }
```

---

### 10.3 `POST /admin/enrollments/:id/reject`
**Body (optional):** `{ "reason": "Course at full capacity." }`

After rejection, student cannot re-enroll for `ENROLLMENT_REJECTION_COOLOFF_HOURS` (default 24 h).

**Response (200):**
```json
{ "id": "enr-abc", "state": "rejected", "rejectedAt": "...", "reason": "..." }
```

---

## 11. Progress Endpoints

### 11.1 `POST /progress/subjects/:id/complete`
Idempotent — second call returns existing record; `completedAt` is immutable.

**Body:** `{ "source": "manual" }` (`"manual"` or `"auto"`, default `"manual"`)

**Response (200):**
```json
{
  "studentUid": "uid-abc", "subjectId": "sub-001", "courseId": "course-abc",
  "state": "completed", "completionSource": "manual",
  "completedAt": "2026-05-07T14:00:00.000Z", "lastAccessedAt": "2026-05-07T14:00:00.000Z"
}
```

---

### 11.2 `POST /progress/subjects/:id/access`
Updates `lastAccessedAt` (powers "Continue Learning").

**Response (200):** `{ "subjectId": "sub-001", "lastAccessedAt": "..." }`

---

### 11.3 `GET /me/progress/courses/:courseId`
**Response (200):**
```json
{
  "courseId": "course-abc", "studentUid": "uid-abc",
  "totalSubjects": 10, "completedCount": 4, "pendingCount": 6,
  "completionPercent": 40.0, "lastAccessedSubjectId": "sub-004"
}
```
`completionPercent` is rounded to 1 decimal place.

---

### 11.4 `GET /me/progress/subjects/:subjectId`
**Responses:** `200` progress record · `404` (student has not accessed this subject)

---

### 11.5 `GET /admin/progress/courses/:courseId`
Aggregated progress for all enrolled students.

**Query params:** `limit`, `cursor`

**Response (200):**
```json
{
  "courseId": "course-abc", "totalSubjects": 10, "enrolledCount": 25,
  "items": [
    { "studentUid": "uid-abc", "studentName": "Viruli W.", "completedCount": 4, "completionPercent": 40.0 }
  ],
  "nextCursor": null, "total": 25
}
```

---

## 12. Notification Endpoints

### 12.1 `GET /me/notifications`
**Query params:** `read` (boolean — `true` returns only read, `false` returns only unread; omit for all), `limit`, `cursor`

**Response item:**
```json
{
  "id": "notif-001", "category": "enrollment_approved",
  "title": "Enrollment Approved", "body": "Your enrollment in '...' has been approved.",
  "payload": { "courseId": "course-abc" }, "readAt": null, "createdAt": "..."
}
```
Response also includes `"unreadCount": 2` at the top level.

---

### 12.2 `POST /me/notifications/:id/read`
**Response (200):** `{ "id": "notif-001", "readAt": "2026-05-07T10:00:00.000Z" }`

---

### 12.3 `POST /me/notifications/read-all`
**Response (200):** `{ "markedCount": 3 }`

---

## 13. User Management — Admin

### 13.1 `GET /users`
**Query params:** `status` (`pending_approval`|`approved`|`rejected`|`suspended`), `role`, `courseId`, `q`, `limit`, `cursor`

---

### 13.2 `GET /users/:uid`
Full profile including enrollment history and per-course progress summary.

**Response (200):**
```json
{
  "uid": "uid-abc", "email": "viruli@example.com", "role": "student", "status": "approved",
  "firstName": "Viruli", "lastName": "Weerasinghe",
  "enrollments": [
    { "courseId": "course-abc", "courseTitle": "...", "enrollmentState": "approved", "completionPercent": 40.0 }
  ]
}
```

---

### 13.3 `POST /users/:uid/suspend`
Disables Firebase account + revokes all refresh tokens.

**Body (optional):** `{ "reason": "Terms violation." }`

**Response (200):** `{ "uid": "...", "status": "suspended" }` · `409 ALREADY_SUSPENDED`

---

### 13.4 `POST /users/:uid/reactivate`
**Response (200):** `{ "uid": "...", "status": "approved" }`

---

## 14. Admin Management — Super Admin

### 14.1 `GET /super-admin/admins`
**Query params:** `status` (`approved`|`suspended`), `q`, `limit`, `cursor`

---

### 14.2 `POST /super-admin/admins`
Admin account is immediately `approved`. Login credentials email is sent.

**Body:**
```json
{ "firstName": "Sapna", "lastName": "Nethmini", "email": "sapna@example.com", "initialPassword": "TempPass@2026" }
```

**Responses:** `201` admin object · `409 EMAIL_EXISTS`

---

### 14.3 `GET /super-admin/admins/:uid`
**Responses:** `200` user object · `404`

---

### 14.4 `POST /super-admin/admins/:uid/suspend`
Disables Firebase Auth account + revokes all refresh tokens. Publishes `admin.suspended` event — suspended admin receives an email.

**Body (optional):** `{ "reason": "Under review." }`

**Response (200):** Full admin user object with `"status": "suspended"`
```json
{
  "uid": "admin-uid-xyz", "email": "sapna@example.com",
  "firstName": "Sapna", "lastName": "Nethmini",
  "role": "admin", "status": "suspended",
  "profilePhotoUrl": null,
  "createdAt": "2026-05-11T04:49:06.197Z",
  "updatedAt": "2026-05-11T05:15:02.254Z", "deletedAt": null
}
```

**Responses:** `200` full user · `404 USER_NOT_FOUND`

---

### 14.5 `POST /super-admin/admins/:uid/reactivate`
Re-enables the Firebase Auth account so the admin can log in again.

**Response (200):** Full admin user object with `"status": "approved"`
```json
{
  "uid": "admin-uid-xyz", "email": "sapna@example.com",
  "firstName": "Sapna", "lastName": "Nethmini",
  "role": "admin", "status": "approved",
  "profilePhotoUrl": null,
  "createdAt": "2026-05-11T04:49:06.197Z",
  "updatedAt": "2026-05-11T05:15:06.084Z", "deletedAt": null
}
```

**Responses:** `200` full user · `404 USER_NOT_FOUND`

---

### 14.6 `DELETE /super-admin/admins/:uid`
Soft-deletes admin profile (`deletedAt` set); Firebase Auth account disabled. Only accounts with `role: "admin"` can be deleted — attempting a `super_admin` or `student` UID returns `404`.

**Responses:** `204` · `404 USER_NOT_FOUND`

---

### 14.7 `POST /super-admin/users/:uid/make-admin`
Promote a student account to admin. Updates Firebase custom claim, sets `role: "admin"` + `status: "approved"` in Firestore, sends promotion email. Cannot be used on accounts that are already `admin` or `super_admin`.

**Response (200):** Full user object with `"role": "admin"`
```json
{
  "uid": "student-uid-abc", "email": "alice@test.com",
  "firstName": "Alice", "lastName": "Cooper",
  "role": "admin", "status": "approved",
  "createdAt": "...", "updatedAt": "...", "deletedAt": null
}
```

**Responses:** `200` full user · `404 USER_NOT_FOUND` · `409 INVALID_ROLE`

---

## 15. Audit Log — Super Admin

### 15.1 `GET /audit-log`
**Query params:**

| Param | Description |
|-------|-------------|
| `actorUid` | Filter by actor UID |
| `action` | Filter by action (e.g. `registration.approved`) |
| `targetType` | `user` · `course` · `enrollment` · `registration` · `admin` · `subject` |
| `targetId` | Filter by specific resource ID |
| `from` / `to` | ISO 8601 date range |
| `limit` | Default 20, max 100 |
| `cursor` | Pagination cursor |

**Response item:**
```json
{
  "id": "audit-001", "actorUid": "admin-uid", "actorEmail": "sapna@example.com",
  "action": "registration.approved", "targetType": "registration", "targetId": "reg-001",
  "payload": { "studentUid": "uid-abc" }, "requestId": "uuid", "createdAt": "..."
}
```

---

## 16. Health Endpoints

### 16.1 `GET /healthz`
**Response (200):** `{ "status": "ok", "service": "course-service", "ts": 1746684000000 }`

---

### 16.2 `GET /readyz`
**Response (200):** `{ "status": "ready" }`  
**Response (503):** `{ "status": "not_ready", "error": "Firestore unreachable" }`

---

## Data Models

### User
```typescript
{ uid, email, role: 'super_admin'|'admin'|'student',
  status: 'pending_approval'|'approved'|'rejected'|'suspended',
  firstName, lastName, profilePhotoUrl: string|null, createdAt, updatedAt }
```

### Course
```typescript
{ id, title, titleSlug, description, coverImageUrl: string|null,
  state: 'draft'|'published'|'archived', createdBy, createdByName,
  semesterCount, publishedAt: string|null, createdAt, updatedAt, deletedAt: string|null,
  semesters?: Semester[] }  // only in GET /courses/:id
```

### Semester
```typescript
{ id, courseId, name, sortOrder, subjectCount, createdAt, updatedAt,
  subjects?: Subject[] }  // only in GET /courses/:id
```

### Subject
```typescript
{ id, semesterId, title, description, youtubeVideoId, sortOrder, attachments: Attachment[], createdAt, updatedAt }
```

### Attachment
```typescript
{ id, subjectId, fileName, mimeType, sizeBytes, uploadedBy, uploadedAt }
// storagePath is internal — not exposed
```

### Enrollment
```typescript
{ id: `${studentUid}_${courseId}`, studentUid, courseId, courseTitle,
  state: 'pending'|'approved'|'rejected'|'withdrawn',
  approvedAt?, rejectedAt?, reason?, createdAt, updatedAt }
```

### SubjectProgress
```typescript
{ studentUid, subjectId, courseId, semesterId,
  state: 'not_started'|'in_progress'|'completed',
  completionSource?: 'manual'|'auto', completedAt?, lastAccessedAt? }
```

### Notification
```typescript
{ id, userUid,
  category: 'registration_approved'|'registration_rejected'|'enrollment_pending'
          |'enrollment_approved'|'enrollment_rejected'|'course_published'|'system',
  title, body, payload: Record<string, unknown>, readAt: string|null, createdAt }
```

### AuditLogEntry
```typescript
{ id, actorUid: string|null, actorEmail: string|null,
  action, targetType, targetId, payload, requestId, createdAt }
// Append-only, immutable
```

---

## Error Code Reference

| Code | Status | Description |
|------|:------:|-------------|
| `VALIDATION_ERROR` | 400 | Zod schema failure — see `error.details` for field errors |
| `INVALID_YOUTUBE_ID` | 400 | YouTube URL/ID is not valid |
| `FILE_TOO_LARGE` | 400 | Uploaded file exceeds 25 MB |
| `MISSING_TOKEN` | 401 | `Authorization: Bearer` header absent |
| `TOKEN_EXPIRED` | 401 | Firebase ID token expired (client should refresh) |
| `TOKEN_REVOKED` | 401 | Token revoked — force re-login |
| `INVALID_TOKEN` | 401 | Token signature invalid |
| `UNAUTHENTICATED` | 401 | Endpoint requires authentication |
| `FORBIDDEN` | 403 | Valid token but insufficient role |
| `ENROLLMENT_REQUIRED` | 403 | Approved enrollment needed to download attachment |
| `COURSE_NOT_FOUND` | 404 | Course not found or not visible to caller's role |
| `SEMESTER_NOT_FOUND` | 404 | Semester not found |
| `SUBJECT_NOT_FOUND` | 404 | Subject not found |
| `ATTACHMENT_NOT_FOUND` | 404 | Attachment not found |
| `ENROLLMENT_NOT_FOUND` | 404 | Enrollment not found |
| `USER_NOT_FOUND` | 404 | User UID does not exist |
| `NOTIFICATION_NOT_FOUND` | 404 | Notification not found |
| `EMAIL_EXISTS` | 409 | Email address already registered |
| `COURSE_TITLE_EXISTS` | 409 | Course with this title already exists |
| `ENROLLMENT_EXISTS` | 409 | Student already has pending or approved enrollment |
| `INVALID_STATE` | 409 | Operation not valid for resource's current state |
| `ALREADY_SUSPENDED` | 409 | Account already suspended |
| `ALREADY_ACTIVE` | 409 | Account already active |
| `NO_SEMESTERS` | 422 | Cannot publish course with no semesters |
| `EMPTY_SEMESTER` | 422 | Every semester must have ≥ 1 subject before publishing |
| `COURSE_NOT_PUBLISHED` | 422 | Enrollment only allowed on published courses |
| `RESUBMIT_TOO_EARLY` | 429 | Must wait cooloff period after rejection before re-enrolling |
| `RATE_LIMIT_EXCEEDED` | 429 | General rate limit hit |
| `AUTH_RATE_LIMIT_EXCEEDED` | 429 | Auth endpoint rate limit hit |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | File type not accepted (PDF/DOC/DOCX only) |
| `INTERNAL_ERROR` | 500 | Unhandled server error (sanitised — no stack trace) |
| `GATEWAY_ERROR` | 502 | Upstream microservice unreachable |

---

## Domain Events Reference

Events published via transactional outbox (not REST-accessible). Consumed by notification-service and audit-service.

| Event | Published By | Key Payload Fields | Notification Target |
|-------|-------------|-------------------|---------------------|
| `user.registered` | auth-service | `uid`, `email`, `firstName`, `lastName` | All admins (in-app) + registering user (email) |
| `registration.approved` | enrollment-service | `studentUid`, `actorUid`, `registrationId` | Student (in-app + email) |
| `registration.rejected` | enrollment-service | `studentUid`, `actorUid`, `reason?` | Student (in-app + email) |
| `enrollment.pending` | enrollment-service | `studentUid`, `courseId`, `enrollmentId` | All admins (in-app) |
| `enrollment.approved` | enrollment-service | `studentUid`, `actorUid`, `courseId` | Student (in-app + email + push) |
| `enrollment.rejected` | enrollment-service | `studentUid`, `actorUid`, `courseId`, `reason?` | Student (in-app + email) |
| `course.published` | course-service | `actorUid`, `courseId`, `courseTitle` | — |
| `progress.subjectCompleted` | progress-service | `studentUid`, `subjectId`, `courseId`, `source` | — |
| `admin.created` | user-service | `uid`, `email`, `firstName`, `lastName`, `actorUid`, `promoted?` | New admin (email — welcome or promotion notice) |
| `admin.suspended` | user-service | `uid`, `email`, `firstName`, `lastName` | Suspended admin (in-app + email) |
| `audit.action` | any service | `actorUid?`, `action`, `targetType`, `targetId` | — |

All events share the envelope: `{ id, type, occurredAt, requestId, payload }`.

---

*CMP Backend · Future CX Lanka (Pvt) Ltd · API v1.0.0*
