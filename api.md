# CMP API Reference

**Project:** Course Management Portal (`slp-backend`) — Future CX Lanka (Pvt) Ltd  
**Version:** 1.1.0 · **Date:** 11 May 2026  
**Firebase Project:** `e-learning-f4209`

---

## Quick Reference

| | |
|---|---|
| **Base URL (local)** | `http://localhost:3000/api/v1` |
| **Base URL (online)** | `https://api.yourdomain.com/api/v1` |
| **Auth header** | `Authorization: Bearer <firebase-id-token>` |
| **Content-Type** | `application/json` on POST / PATCH with body |
| **Correlation** | `X-Request-Id: <uuid-v4>` — optional; server generates if absent, echoed in all responses |
| **Token refresh** | Always call `user.getIdToken()` before each request — tokens expire after 1 hour |

---

## Roles

| Role | Created by | Capabilities |
|------|-----------|-------------|
| `student` | Self-registration | Own profile, course catalog, own enrollments, progress, notifications |
| `admin` | Super Admin (`POST /super-admin/admins`) | All course/enrollment/user management. **No** student-facing features |
| `admin` *(promoted)* | Super Admin (`POST /super-admin/users/:uid/make-admin`) | **Dual-role** — all admin capabilities **plus** all student capabilities |
| `super_admin` | Pre-seeded / service account | Everything admin can do + admin account management + audit log |

> `super_admin` inherits all `admin` permissions on every route.  
> Promoted admins carry `roles: ["student", "admin"]` in their token — they pass both `student` and `admin` route guards simultaneously.

---

## Endpoint Index

**57 external endpoints — all implemented and verified (2026-05-11)**

| # | Method | Path | Roles | Service |
|---|--------|------|-------|---------|
| **Auth** | | | | auth-service |
| 2.1 | POST | `/auth/register` | Public | auth-service |
| 2.2 | POST | `/auth/logout` | Any | auth-service |
| 2.3 | POST | `/auth/password-reset` | Public | auth-service |
| 2.4 | POST | `/auth/track-failure` | Public | auth-service |
| **Profile** | | | | user-service |
| 3.1 | GET | `/me` | Any | user-service |
| 3.2 | PATCH | `/me` | Any | user-service |
| 3.3 | POST | `/me/change-password` | Any | user-service |
| **Courses** | | | | course-service |
| 4.1 | GET | `/courses` | Public (role-aware) | course-service |
| 4.2 | GET | `/courses/:id` | Public (role-aware) | course-service |
| 4.3 | POST | `/courses` | admin | course-service |
| 4.4 | PATCH | `/courses/:id` | admin | course-service |
| 4.5 | POST | `/courses/:id/publish` | admin | course-service |
| 4.6 | POST | `/courses/:id/unpublish` | admin | course-service |
| 4.7 | POST | `/courses/:id/archive` | admin | course-service |
| 4.8 | DELETE | `/courses/:id` | admin | course-service |
| **Semesters** | | | | course-service |
| 5.1 | POST | `/courses/:id/semesters` | admin | course-service |
| 5.2 | PATCH | `/semesters/:id` | admin | course-service |
| 5.3 | DELETE | `/semesters/:id` | admin | course-service |
| **Subjects** | | | | course-service |
| 6.1 | POST | `/semesters/:id/subjects` | admin | course-service |
| 6.2 | PATCH | `/subjects/:id` | admin | course-service |
| 6.3 | DELETE | `/subjects/:id` | admin | course-service |
| **Attachments** | | | | storage-service |
| 7.1 | POST | `/subjects/:id/attachments` | admin | storage-service |
| 7.2 | GET | `/attachments/:id/download-url` | student, admin | storage-service |
| 7.3 | DELETE | `/attachments/:id` | admin | storage-service |
| **Enrollment — Student** | | | | enrollment-service |
| 8.1 | POST | `/courses/:id/enroll` | student | enrollment-service |
| 8.2 | GET | `/me/enrollments` | student | enrollment-service |
| 8.3 | POST | `/enrollments/:id/withdraw` | student | enrollment-service |
| **Registration Queue — Admin** | | | | enrollment-service |
| 9.1 | GET | `/admin/registrations` | admin | enrollment-service |
| 9.2 | POST | `/admin/registrations/:id/approve` | admin | enrollment-service |
| 9.3 | POST | `/admin/registrations/:id/reject` | admin | enrollment-service |
| 9.4 | POST | `/admin/registrations/bulk-approve` | admin | enrollment-service |
| **Enrollment Queue — Admin** | | | | enrollment-service |
| 10.1 | GET | `/admin/enrollments` | admin | enrollment-service |
| 10.2 | POST | `/admin/enrollments/:id/approve` | admin | enrollment-service |
| 10.3 | POST | `/admin/enrollments/:id/reject` | admin | enrollment-service |
| **Progress** | | | | progress-service |
| 11.1 | POST | `/progress/subjects/:id/complete` | student | progress-service |
| 11.2 | POST | `/progress/subjects/:id/access` | student | progress-service |
| 11.3 | GET | `/me/progress/courses/:courseId` | student | progress-service |
| 11.4 | GET | `/me/progress/subjects/:subjectId` | student | progress-service |
| 11.5 | GET | `/admin/progress/courses/:courseId` | admin | progress-service |
| **Notifications** | | | | notification-service |
| 12.1 | GET | `/me/notifications` | Any | notification-service |
| 12.2 | POST | `/me/notifications/:id/read` | Any | notification-service |
| 12.3 | POST | `/me/notifications/read-all` | Any | notification-service |
| **User Management — Admin** | | | | user-service |
| 13.1 | GET | `/users` | admin | user-service |
| 13.2 | GET | `/users/:uid` | admin | user-service |
| 13.3 | POST | `/users/:uid/suspend` | admin | user-service |
| 13.4 | POST | `/users/:uid/reactivate` | admin | user-service |
| **Admin Management — Super Admin** | | | | user-service |
| 14.1 | GET | `/super-admin/admins` | super_admin | user-service |
| 14.2 | POST | `/super-admin/admins` | super_admin | user-service |
| 14.3 | GET | `/super-admin/admins/:uid` | super_admin | user-service |
| 14.4 | POST | `/super-admin/admins/:uid/suspend` | super_admin | user-service |
| 14.5 | POST | `/super-admin/admins/:uid/reactivate` | super_admin | user-service |
| 14.6 | DELETE | `/super-admin/admins/:uid` | super_admin | user-service |
| 14.7 | POST | `/super-admin/users/:uid/make-admin` | super_admin | user-service |
| **Audit Log** | | | | audit-service |
| 15.1 | GET | `/audit-log` | super_admin | audit-service |
| **Health** | | | | all services |
| 16.1 | GET | `/healthz` | Public | all services |
| 16.2 | GET | `/readyz` | Public | all services |

---

## Response Shapes

**Single resource**
```json
{ "id": "abc", "title": "...", "createdAt": "2026-05-01T08:00:00.000Z" }
```

**Paginated list**
```json
{ "items": [...], "nextCursor": "abc123", "total": 47 }
```
`nextCursor` is `null` on the last page. Omit `cursor` on the first request.

**Empty success (DELETE / some POSTs)**
```
HTTP 204 No Content  (empty body)
```

**Error**
```json
{
  "error": { "code": "COURSE_NOT_FOUND", "message": "...", "details": {} },
  "requestId": "7f3a1c2d-4e5b-6f7a-8b9c-0d1e2f3a4b5c"
}
```
`details` only present on `400` — contains field-level validation messages.

---

## Pagination

| Param | Type | Default | Max |
|-------|------|:-------:|:---:|
| `limit` | number | 20 | 100 |
| `cursor` | string | — | — |

---

## Rate Limits

| Scope | Limit |
|-------|-------|
| `POST /auth/*` | 10 req / IP / min |
| All other endpoints | 200 req / IP / min |

Exceeded → `429` with `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After` headers.

---

## 2. Auth Endpoints

### 2.1 `POST /auth/register`
Register a new student account. Created in `pending_approval` state — cannot log in until approved.

**Authentication:** None (public)

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

**Responses:** `201 { "message": "Registration submitted..." }` · `400 VALIDATION_ERROR` · `409 EMAIL_EXISTS`

---

### 2.2 `POST /auth/logout`
Revoke all refresh tokens for the authenticated user. Existing ID tokens remain valid until their 1-hour expiry.

**Authentication:** Bearer token required

**Body:** None

**Responses:** `200 { "message": "Logged out successfully." }` · `401`

---

### 2.3 `POST /auth/password-reset`
Trigger a password reset email. Always returns `200` regardless of whether the email exists (prevents enumeration).

**Authentication:** None (public)

**Body:** `{ "email": "viruli@example.com" }`

**Response:** `200 { "message": "If an account exists for this email, a reset link has been sent." }`

---

### 2.4 `POST /auth/track-failure`
Record a failed login attempt for account lockout tracking (10 attempts → 15-min lockout).

**Authentication:** None (public)

**Body:** `{ "email": "viruli@example.com" }`

**Responses:** `200 { "attempts": 3, "locked": false }` · `423 { "locked": true, "unlockAt": "..." }`

---

## 3. Profile Endpoints

### 3.1 `GET /me`
**Authentication:** Bearer token required · **Roles:** Any

**Response (200):**
```json
{
  "uid":             "firebase-uid-abc123",
  "email":           "viruli@example.com",
  "role":            "student",
  "roles":           ["student"],
  "status":          "approved",
  "firstName":       "Viruli",
  "lastName":        "Weerasinghe",
  "profilePhotoUrl": null,
  "createdAt":       "2026-05-01T08:00:00.000Z",
  "updatedAt":       "2026-05-05T10:30:00.000Z"
}
```

> Promoted admins will have `"role": "admin"` and `"roles": ["student", "admin"]`.

---

### 3.2 `PATCH /me`
Partial update. Only `firstName`, `lastName`, `profilePhotoUrl` may be changed — `email`, `role`, and `status` are immutable through this endpoint.

**Authentication:** Bearer token required · **Roles:** Any

**Body (all optional):**
```json
{ "firstName": "Viruli", "lastName": "W.", "profilePhotoUrl": "https://..." }
```

**Responses:** `200` updated user · `400 VALIDATION_ERROR`

---

### 3.3 `POST /me/change-password`
**Authentication:** Bearer token required · **Roles:** Any

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
**Authentication:** Optional · **Roles:** All (filtered by role)

- **Students / Public:** Published courses only
- **Admin / Super Admin:** All states (draft, published, archived)

**Query params:**

| Param | Description |
|-------|-------------|
| `limit` | Items per page (default 20, max 100) |
| `cursor` | Pagination cursor |
| `state` | Admin only: `draft` \| `published` \| `archived` |
| `q` | Search by title (partial, case-insensitive) |

**Response (200):** Paginated list — each item:
```json
{
  "id": "course-abc", "title": "Introduction to TypeScript",
  "description": "Learn TypeScript from scratch.",
  "coverImageUrl": "https://...", "state": "published",
  "semesterCount": 3, "createdBy": "admin-uid", "createdByName": "Sapna Nethmini",
  "publishedAt": "2026-05-03T09:00:00.000Z",
  "createdAt": "2026-05-01T08:00:00.000Z", "updatedAt": "2026-05-03T09:00:00.000Z"
}
```

---

### 4.2 `GET /courses/:id`
Full course with nested `semesters → subjects → attachments`.

**Authentication:** Optional · **Roles:** All (filtered by role)

- **Students / Public:** `404` if course is `draft` or `archived`
- **Admin / Super Admin:** Returns course in any state

**Response (200):**
```json
{
  "id": "course-abc", "title": "Introduction to TypeScript",
  "state": "published", "coverImageUrl": "https://...",
  "semesterCount": 2, "createdBy": "admin-uid", "createdByName": "Sapna Nethmini",
  "publishedAt": "2026-05-03T09:00:00.000Z",
  "semesters": [
    {
      "id": "sem-001", "name": "Semester 1 — Foundations", "sortOrder": 1,
      "subjects": [
        {
          "id": "sub-001", "title": "TypeScript Basics",
          "youtubeVideoId": "zQnBQ4tB3ZA", "sortOrder": 1,
          "attachments": [
            { "id": "att-001", "fileName": "notes.pdf", "mimeType": "application/pdf", "sizeBytes": 204800 }
          ]
        }
      ]
    }
  ]
}
```

**Responses:** `200` · `404 COURSE_NOT_FOUND`

---

### 4.3 `POST /courses`
Create a course in `draft` state.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:**
```json
{ "title": "Introduction to TypeScript", "description": "...", "coverImageUrl": null }
```

| Field | Validation |
|-------|-----------|
| `title` | 1–200 chars, unique |
| `description` | 1–5000 chars |
| `coverImageUrl` | HTTPS URL or null |

**Responses:** `201` course object · `400 VALIDATION_ERROR` · `409 COURSE_TITLE_EXISTS`

---

### 4.4 `PATCH /courses/:id`
All fields optional. Course must be in `draft` state.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:** `{ "title": "...", "description": "...", "coverImageUrl": "..." }`

**Responses:** `200` updated course · `404 COURSE_NOT_FOUND`

---

### 4.5 `POST /courses/:id/publish`
Move course from `draft` → `published`. Makes it visible in the public catalog.

**Pre-conditions (server-enforced):**
- Course must have ≥ 1 semester
- Every semester must have ≥ 1 subject

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:** None

**Responses:** `200` course with `state: "published"` · `409 INVALID_STATE` · `422 NO_SEMESTERS` · `422 EMPTY_SEMESTER`

---

### 4.6 `POST /courses/:id/unpublish`
Move course from `published` → `draft`. Hides it from the public catalog.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `200` course with `state: "draft"` · `409 INVALID_STATE`

---

### 4.7 `POST /courses/:id/archive`
Move course from `published` → `archived`. Hidden from catalog; enrolled students retain read-only content access.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `200` course with `state: "archived"` · `409 INVALID_STATE`

---

### 4.8 `DELETE /courses/:id`
Soft-delete. Sets `deletedAt` timestamp — recoverable within 30 days.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `204` · `404 COURSE_NOT_FOUND`

---

## 5. Semester Endpoints

### 5.1 `POST /courses/:id/semesters`
**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:**
```json
{ "name": "Semester 1 — Foundations", "sortOrder": 1 }
```

| Field | Validation |
|-------|-----------|
| `name` | 1–200 chars |
| `sortOrder` | Positive integer, controls display order |

**Response (201):**
```json
{ "id": "sem-001", "courseId": "course-abc", "name": "Semester 1 — Foundations", "sortOrder": 1, "subjectCount": 0, "createdAt": "..." }
```

**Responses:** `201` · `404 COURSE_NOT_FOUND`

---

### 5.2 `PATCH /semesters/:id`
All fields optional.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:** `{ "name": "...", "sortOrder": 2 }`

**Responses:** `200` updated semester · `404 SEMESTER_NOT_FOUND`

---

### 5.3 `DELETE /semesters/:id`
Soft-deletes semester and all its subjects.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `204` · `404 SEMESTER_NOT_FOUND`

---

## 6. Subject Endpoints

### 6.1 `POST /semesters/:id/subjects`
**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:**
```json
{
  "title":          "TypeScript Basics",
  "description":    "Variables, types, interfaces, and enums.",
  "youtubeVideoUrl":"https://www.youtube.com/watch?v=zQnBQ4tB3ZA",
  "sortOrder":      1
}
```

| Field | Validation |
|-------|-----------|
| `title` | 1–200 chars |
| `description` | 1–5000 chars |
| `youtubeVideoUrl` | Valid YouTube URL or 11-char video ID |
| `sortOrder` | Positive integer |

> Server stores only the 11-character YouTube video ID regardless of URL format.

**Response (201):**
```json
{ "id": "sub-001", "semesterId": "sem-001", "title": "TypeScript Basics", "youtubeVideoId": "zQnBQ4tB3ZA", "sortOrder": 1, "attachments": [], "createdAt": "..." }
```

**Responses:** `201` · `400 INVALID_YOUTUBE_ID` · `404 SEMESTER_NOT_FOUND`

---

### 6.2 `PATCH /subjects/:id`
All fields optional.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:** `{ "title": "...", "description": "...", "youtubeVideoUrl": "...", "sortOrder": 2 }`

**Responses:** `200` updated subject · `404 SUBJECT_NOT_FOUND`

---

### 6.3 `DELETE /subjects/:id`
**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `204` · `404 SUBJECT_NOT_FOUND`

---

## 7. Attachment Endpoints

### 7.1 `POST /subjects/:id/attachments`
**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`  
**Content-Type:** `multipart/form-data` · Form field name: `file`

| Constraint | Value |
|-----------|-------|
| Accepted types | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| Max size | 25 MB |

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/subjects/sub-001/attachments \
  -H "Authorization: Bearer <token>" \
  -F "file=@lesson-notes.pdf"
```

**Response (201):**
```json
{
  "id": "att-001", "subjectId": "sub-001",
  "fileName": "lesson-notes.pdf", "mimeType": "application/pdf",
  "sizeBytes": 204800, "uploadedBy": "admin-uid",
  "uploadedAt": "2026-05-02T10:00:00.000Z"
}
```

**Responses:** `201` · `400 FILE_TOO_LARGE` · `415 UNSUPPORTED_MEDIA_TYPE` · `404 SUBJECT_NOT_FOUND`

---

### 7.2 `GET /attachments/:id/download-url`
Returns a signed download URL expiring in **15 minutes**.

**Authentication:** Bearer token required · **Roles:** `student` (approved enrollment required), `admin`, `super_admin`

**Response (200):**
```json
{ "downloadUrl": "https://storage.googleapis.com/...?X-Goog-Signature=...", "expiresAt": "2026-05-07T10:15:00.000Z" }
```

**Responses:** `200` · `403 ENROLLMENT_REQUIRED` · `404 ATTACHMENT_NOT_FOUND`

---

### 7.3 `DELETE /attachments/:id`
Removes from Cloud Storage and the subject's attachment list.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `204` · `404 ATTACHMENT_NOT_FOUND`

---

## 8. Enrollment — Student

### 8.1 `POST /courses/:id/enroll`
Submit enrollment for a published course. Enters `pending` state until admin approves.

**Authentication:** Bearer token required · **Roles:** `student`

**Constraints:**
- Course must be `published`
- Student account must be `approved`
- Max 1 pending or approved enrollment per course

**Body:** None

**Response (201):**
```json
{
  "id": "uid-abc_course-abc", "courseId": "course-abc",
  "courseTitle": "Introduction to TypeScript",
  "studentUid": "uid-abc", "state": "pending",
  "createdAt": "2026-05-05T08:00:00.000Z", "updatedAt": "2026-05-05T08:00:00.000Z"
}
```

**Responses:** `201` · `409 ENROLLMENT_EXISTS` · `422 COURSE_NOT_PUBLISHED` · `429 RESUBMIT_TOO_EARLY`

---

### 8.2 `GET /me/enrollments`
**Authentication:** Bearer token required · **Roles:** `student`

**Query params:** `state` (`pending`|`approved`|`rejected`|`withdrawn`), `limit`, `cursor`

**Response (200):** Paginated list — each item:
```json
{
  "id": "enr-abc", "courseId": "course-abc", "courseTitle": "Introduction to TypeScript",
  "state": "approved", "approvedAt": "2026-05-06T09:00:00.000Z",
  "createdAt": "...", "updatedAt": "..."
}
```

---

### 8.3 `POST /enrollments/:id/withdraw`
Only `pending` enrollments may be withdrawn.

**Authentication:** Bearer token required · **Roles:** `student`

**Body:** None

**Responses:** `200` enrollment with `state: "withdrawn"` · `409 INVALID_STATE`

---

## 9. Registration Queue — Admin

### 9.1 `GET /admin/registrations`
**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Query params:** `status` (default `pending`), `q` (name/email search), `limit`, `cursor`

**Response (200):** Paginated list — each item:
```json
{
  "id": "reg-001", "studentUid": "uid-abc",
  "firstName": "Viruli", "lastName": "Weerasinghe",
  "email": "viruli@example.com", "status": "pending",
  "submittedAt": "2026-05-05T08:00:00.000Z"
}
```

---

### 9.2 `POST /admin/registrations/:id/approve`
Sets student account status → `approved`. Sends in-app + email notification to student.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:** None

**Response (200):** `{ "message": "Registration approved.", "studentUid": "uid-abc" }`

**Responses:** `200` · `409 INVALID_STATE`

---

### 9.3 `POST /admin/registrations/:id/reject`
**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body (optional):** `{ "reason": "Incomplete registration information." }`

**Response (200):** `{ "message": "Registration rejected.", "studentUid": "uid-abc" }`

---

### 9.4 `POST /admin/registrations/bulk-approve`
Approve multiple pending registrations. Uses `Promise.allSettled` — partial success is possible.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:**
```json
{ "ids": ["reg-001", "reg-002", "reg-003"] }
```

| Field | Validation |
|-------|-----------|
| `ids` | Array of registration IDs, max 100 per request |

**Response (200):**
```json
{
  "approved": ["reg-001", "reg-003"],
  "failed": [{ "id": "reg-002", "reason": "Registration is no longer pending." }]
}
```

---

## 10. Enrollment Queue — Admin

### 10.1 `GET /admin/enrollments`
**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Query params:** `status` (default `pending`), `courseId`, `limit`, `cursor`

**Response (200):** Paginated list — each item:
```json
{
  "id": "enr-abc", "studentUid": "uid-abc", "studentName": "Viruli Weerasinghe",
  "studentEmail": "viruli@example.com", "courseId": "course-abc",
  "courseTitle": "Introduction to TypeScript", "state": "pending",
  "submittedAt": "2026-05-05T08:00:00.000Z"
}
```

---

### 10.2 `POST /admin/enrollments/:id/approve`
Grants student access to course content. Sends in-app + email + push notification.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:** None

**Response (200):**
```json
{ "id": "enr-abc", "courseId": "course-abc", "state": "approved", "approvedAt": "2026-05-06T09:00:00.000Z" }
```

**Responses:** `200` · `409 INVALID_STATE`

---

### 10.3 `POST /admin/enrollments/:id/reject`
After rejection, student cannot re-enroll for `ENROLLMENT_REJECTION_COOLOFF_HOURS` (default 24 h).

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body (optional):** `{ "reason": "Course at full capacity." }`

**Response (200):**
```json
{ "id": "enr-abc", "state": "rejected", "rejectedAt": "...", "reason": "Course at full capacity." }
```

---

## 11. Progress Endpoints

### 11.1 `POST /progress/subjects/:id/complete`
Mark a subject as completed. **Idempotent** — if already `completed`, returns existing record unchanged. `completedAt` is immutable once set.

**Authentication:** Bearer token required · **Roles:** `student`

**Body:**
```json
{ "courseId": "course-abc", "semesterId": "sem-001" }
```

**Response (200):**
```json
{
  "studentUid": "uid-abc", "subjectId": "sub-001",
  "courseId": "course-abc", "semesterId": "sem-001",
  "state": "completed", "completionSource": "manual",
  "completedAt": "2026-05-07T14:00:00.000Z",
  "lastAccessedAt": "2026-05-07T14:00:00.000Z"
}
```

---

### 11.2 `POST /progress/subjects/:id/access`
Update `lastAccessedAt` timestamp (powers "Continue Learning" resume feature).

**Authentication:** Bearer token required · **Roles:** `student`

**Body:** `{ "courseId": "course-abc", "semesterId": "sem-001" }`

**Response (200):** `{ "subjectId": "sub-001", "lastAccessedAt": "2026-05-07T14:30:00.000Z" }`

---

### 11.3 `GET /me/progress/courses/:courseId`
**Authentication:** Bearer token required · **Roles:** `student`

**Response (200):**
```json
{
  "courseId": "course-abc", "studentUid": "uid-abc",
  "totalSubjects": 10, "completedCount": 4, "pendingCount": 6,
  "completionPercent": 40.0, "lastAccessedSubjectId": "sub-004"
}
```
`completionPercent` is rounded to 1 decimal place. `lastAccessedSubjectId` is `null` if no subjects accessed.

---

### 11.4 `GET /me/progress/subjects/:subjectId`
**Authentication:** Bearer token required · **Roles:** `student`

**Responses:** `200` progress record · `404` (student has not accessed this subject yet)

---

### 11.5 `GET /admin/progress/courses/:courseId`
Aggregated progress for all students enrolled in a course.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Query params:** `limit`, `cursor`

**Response (200):**
```json
{
  "courseId": "course-abc", "courseTitle": "Introduction to TypeScript",
  "totalSubjects": 10, "enrolledCount": 25,
  "items": [
    { "studentUid": "uid-abc", "studentName": "Viruli Weerasinghe", "completedCount": 4, "completionPercent": 40.0, "lastAccessedAt": "..." }
  ],
  "nextCursor": null, "total": 25
}
```

---

## 12. Notification Endpoints

### 12.1 `GET /me/notifications`
Newest first.

**Authentication:** Bearer token required · **Roles:** Any

**Query params:** `unreadOnly` (boolean, default `false`), `limit`, `cursor`

**Response (200):**
```json
{
  "items": [
    {
      "id": "notif-001", "category": "enrollment_approved",
      "title": "Enrollment Approved",
      "body": "Your enrollment in 'Introduction to TypeScript' has been approved.",
      "payload": { "courseId": "course-abc", "enrollmentId": "enr-abc" },
      "readAt": null, "createdAt": "2026-05-06T09:05:00.000Z"
    }
  ],
  "nextCursor": null, "total": 3, "unreadCount": 2
}
```

---

### 12.2 `POST /me/notifications/:id/read`
**Authentication:** Bearer token required · **Roles:** Any

**Body:** None

**Response (200):** `{ "id": "notif-001", "readAt": "2026-05-07T10:00:00.000Z" }`

---

### 12.3 `POST /me/notifications/read-all`
**Authentication:** Bearer token required · **Roles:** Any

**Body:** None

**Response (200):** `{ "markedCount": 3 }`

---

## 13. User Management — Admin

### 13.1 `GET /users`
**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Query params:**

| Param | Description |
|-------|-------------|
| `status` | `pending_approval` \| `approved` \| `rejected` \| `suspended` |
| `role` | Filter by role (default `student`) |
| `courseId` | Filter students enrolled in a specific course |
| `q` | Search by name or email (partial) |
| `limit` | Default 25, max 100 |
| `cursor` | Pagination cursor |

**Response (200):** Paginated list — each item:
```json
{
  "uid": "uid-abc", "email": "viruli@example.com",
  "role": "student", "roles": ["student"], "status": "approved",
  "firstName": "Viruli", "lastName": "Weerasinghe",
  "enrolledCourses": 2, "createdAt": "2026-05-01T08:00:00.000Z"
}
```

---

### 13.2 `GET /users/:uid`
Full profile including enrollment history and per-course progress summary.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Response (200):**
```json
{
  "uid": "uid-abc", "email": "viruli@example.com",
  "role": "student", "roles": ["student"], "status": "approved",
  "firstName": "Viruli", "lastName": "Weerasinghe", "profilePhotoUrl": null,
  "createdAt": "2026-05-01T08:00:00.000Z",
  "enrollments": [
    { "courseId": "course-abc", "courseTitle": "Introduction to TypeScript", "enrollmentState": "approved", "completionPercent": 40.0, "approvedAt": "..." }
  ]
}
```

---

### 13.3 `POST /users/:uid/suspend`
Disables Firebase Auth account + revokes all refresh tokens.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body (optional):** `{ "reason": "Terms of service violation." }`

**Response (200):** `{ "uid": "uid-abc", "status": "suspended" }`

**Responses:** `200` · `409 ALREADY_SUSPENDED` · `404 USER_NOT_FOUND`

---

### 13.4 `POST /users/:uid/reactivate`
**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Body:** None

**Response (200):** `{ "uid": "uid-abc", "status": "approved" }`

**Responses:** `200` · `409 ALREADY_ACTIVE` · `404 USER_NOT_FOUND`

---

## 14. Admin Management — Super Admin

### 14.1 `GET /super-admin/admins`
**Authentication:** Bearer token required · **Roles:** `super_admin`

**Query params:** `status` (`approved`|`suspended`), `q`, `limit`, `cursor`

**Response (200):** Paginated list — each item:
```json
{
  "uid": "admin-uid", "email": "sapna@example.com",
  "role": "admin", "roles": ["admin"], "status": "approved",
  "firstName": "Sapna", "lastName": "Nethmini",
  "createdAt": "2026-01-10T08:00:00.000Z"
}
```

---

### 14.2 `POST /super-admin/admins`
Create a new admin account. Immediately `approved`. Login credentials email sent.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Body:**
```json
{ "firstName": "Sapna", "lastName": "Nethmini", "email": "sapna@example.com", "initialPassword": "TempPass@2026!" }
```

| Field | Validation |
|-------|-----------|
| `firstName` / `lastName` | 1–100 chars |
| `email` | Valid email, unique |
| `initialPassword` | Min 10 chars · complexity rules |

**Response (201):**
```json
{
  "uid": "admin-uid", "email": "sapna@example.com",
  "role": "admin", "roles": ["admin"], "status": "approved",
  "firstName": "Sapna", "lastName": "Nethmini",
  "createdAt": "2026-05-07T08:00:00.000Z"
}
```

**Responses:** `201` · `409 EMAIL_EXISTS`

---

### 14.3 `GET /super-admin/admins/:uid`
**Authentication:** Bearer token required · **Roles:** `super_admin`

**Responses:** `200` full user object · `404 USER_NOT_FOUND`

---

### 14.4 `POST /super-admin/admins/:uid/suspend`
Disables Firebase Auth account + revokes tokens. Publishes `admin.suspended` event — suspended admin receives email notification.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Body (optional):** `{ "reason": "Under review." }`

**Response (200):**
```json
{
  "uid": "admin-uid-xyz", "email": "sapna@example.com",
  "firstName": "Sapna", "lastName": "Nethmini",
  "role": "admin", "roles": ["admin"], "status": "suspended",
  "profilePhotoUrl": null,
  "createdAt": "2026-05-11T04:49:06.197Z",
  "updatedAt": "2026-05-11T05:15:02.254Z", "deletedAt": null
}
```

**Responses:** `200` · `404 USER_NOT_FOUND`

---

### 14.5 `POST /super-admin/admins/:uid/reactivate`
Re-enables the Firebase Auth account.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Body:** None

**Response (200):**
```json
{
  "uid": "admin-uid-xyz", "email": "sapna@example.com",
  "firstName": "Sapna", "lastName": "Nethmini",
  "role": "admin", "roles": ["admin"], "status": "approved",
  "profilePhotoUrl": null,
  "createdAt": "2026-05-11T04:49:06.197Z",
  "updatedAt": "2026-05-11T05:15:06.084Z", "deletedAt": null
}
```

**Responses:** `200` · `404 USER_NOT_FOUND`

---

### 14.6 `DELETE /super-admin/admins/:uid`
Soft-delete admin profile (`deletedAt` set); Firebase Auth account disabled. Only `role: "admin"` accounts — attempting a `super_admin` or `student` UID returns `404`.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Body:** None

**Responses:** `204` · `404 USER_NOT_FOUND`

---

### 14.7 `POST /super-admin/users/:uid/make-admin`
Promote a student account to admin. The promoted user retains their student role alongside admin (**dual-role**) — they can manage courses as an admin and enroll/track progress as a student within the same session.

**What changes:**
- `role` → `"admin"` (primary role)
- `roles` → `["student", "admin"]`
- `status` → `"approved"`
- Firebase custom claim updated immediately

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Body:** None

**Constraints:** Only `role: "student"` accounts — already `admin` or `super_admin` returns `409 INVALID_ROLE`

**Side effect:** Publishes `admin.created` event (`promoted: true`) — promotion email sent to user

**Response (200):**
```json
{
  "uid": "student-uid-abc", "email": "alice@test.com",
  "firstName": "Alice", "lastName": "Cooper",
  "role": "admin", "roles": ["student", "admin"],
  "status": "approved", "profilePhotoUrl": null,
  "createdAt": "2026-05-11T06:05:46.338Z",
  "updatedAt": "2026-05-11T06:06:09.447Z", "deletedAt": null
}
```

> Existing enrollments, progress records, and notifications are preserved. The promoted admin can continue using all student features.

**Responses:** `200` · `404 USER_NOT_FOUND` · `409 INVALID_ROLE`

---

## 15. Audit Log — Super Admin

### 15.1 `GET /audit-log`
Append-only, immutable log. Records are never modified or deleted.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Query params:**

| Param | Description |
|-------|-------------|
| `actorUid` | Filter by actor UID |
| `action` | Filter by action type (e.g. `registration.approved`) |
| `targetType` | `user` \| `course` \| `enrollment` \| `registration` \| `admin` \| `subject` |
| `targetId` | Filter by specific resource ID |
| `from` / `to` | ISO 8601 date range |
| `limit` | Default 20, max 100 |
| `cursor` | Pagination cursor |

**Response (200):** Paginated list — each item:
```json
{
  "id": "audit-001", "actorUid": "admin-uid", "actorEmail": "sapna@example.com",
  "action": "registration.approved", "targetType": "registration", "targetId": "reg-001",
  "payload": { "studentUid": "uid-abc" },
  "requestId": "7f3a1c2d-4e5b-6f7a-8b9c-0d1e2f3a4b5c",
  "createdAt": "2026-05-06T09:00:00.000Z"
}
```

---

## 16. Health Endpoints

Available directly on each service (`http://[host]:[port]/healthz`) — not proxied through gateway.

### 16.1 `GET /healthz`
Liveness probe — checks the service process is running.

**Response (200):** `{ "status": "ok", "service": "course-service", "ts": 1746684000000 }`

---

### 16.2 `GET /readyz`
Readiness probe — checks Firestore connectivity.

**Response (200):** `{ "status": "ready" }`

**Response (503):** `{ "status": "not_ready", "error": "Firestore unreachable" }`

---

## Data Models

### User
```typescript
interface User {
  uid:             string;
  email:           string;
  role:            'super_admin' | 'admin' | 'student';  // primary role
  roles:           UserRole[];   // full set — promoted admins: ['student','admin']
  status:          'pending_approval' | 'approved' | 'rejected' | 'suspended';
  firstName:       string;
  lastName:        string;
  profilePhotoUrl: string | null;
  createdAt:       string;  // ISO 8601
  updatedAt:       string;
  deletedAt:       string | null;  // set on soft-delete
}
```

> `roles` is the authoritative set used by authorization middleware. `role` is the primary role for display and filtering.

### Course
```typescript
interface Course {
  id: string; title: string; titleSlug: string;
  description: string; coverImageUrl: string | null;
  state: 'draft' | 'published' | 'archived';
  createdBy: string; createdByName: string;
  semesterCount: number; publishedAt: string | null;
  createdAt: string; updatedAt: string; deletedAt: string | null;
  semesters?: Semester[];  // only in GET /courses/:id
}
```

### Semester
```typescript
interface Semester {
  id: string; courseId: string; name: string;
  sortOrder: number; subjectCount: number;
  createdAt: string; updatedAt: string;
  subjects?: Subject[];  // only in GET /courses/:id
}
```

### Subject
```typescript
interface Subject {
  id: string; semesterId: string; title: string; description: string;
  youtubeVideoId: string;  // 11-char YouTube video ID
  sortOrder: number; attachments: Attachment[];
  createdAt: string; updatedAt: string;
}
```

### Attachment
```typescript
interface Attachment {
  id: string; subjectId: string; fileName: string;
  mimeType: string; sizeBytes: number;
  uploadedBy: string;  // admin UID
  uploadedAt: string;
  // storagePath is internal — NOT exposed to clients
}
```

### Enrollment
```typescript
interface Enrollment {
  id: string;  // composite: `${studentUid}_${courseId}`
  studentUid: string; courseId: string; courseTitle: string;
  state: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvedAt?: string; rejectedAt?: string; reason?: string;
  createdAt: string; updatedAt: string;
}
```

### SubjectProgress
```typescript
interface SubjectProgress {
  studentUid: string; subjectId: string; courseId: string; semesterId: string;
  state: 'not_started' | 'in_progress' | 'completed';
  completionSource?: 'manual' | 'auto';
  completedAt?: string;     // immutable once set
  lastAccessedAt?: string;
}
```

### CourseProgressAggregate
```typescript
interface CourseProgressAggregate {
  courseId: string; studentUid: string;
  totalSubjects: number; completedCount: number; pendingCount: number;
  completionPercent: number;  // 0.0–100.0, 1 decimal place
  lastAccessedSubjectId: string | null;
}
```

### Notification
```typescript
interface Notification {
  id: string; userUid: string;
  category: 'registration_approved' | 'registration_rejected'
           | 'enrollment_pending' | 'enrollment_approved' | 'enrollment_rejected'
           | 'course_published' | 'system';
  title: string; body: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}
```

### AuditLogEntry
```typescript
interface AuditLogEntry {
  id: string;
  actorUid: string | null;   // null for system events
  actorEmail: string | null;
  action: string;            // e.g. 'registration.approved'
  targetType: string;        // 'user' | 'course' | 'enrollment' | ...
  targetId: string;
  payload: Record<string, unknown>;
  requestId: string;
  createdAt: string;  // immutable — append-only
}
```

---

## HTTP Status Code Reference

| Status | Trigger |
|--------|---------|
| `200 OK` | GET, PATCH, POST returning data |
| `201 Created` | POST that creates a new resource |
| `204 No Content` | DELETE / logout / read-all |
| `400 Bad Request` | Zod validation failure / bad file |
| `401 Unauthorized` | Missing / expired / revoked token |
| `403 Forbidden` | Valid token, wrong role or missing enrollment |
| `404 Not Found` | Entity not found / DRAFT course accessed by student |
| `409 Conflict` | Duplicate / invalid state transition |
| `415 Unsupported Media Type` | Wrong file type on upload |
| `422 Unprocessable Entity` | Business rule violation |
| `423 Locked` | Account locked (too many login failures) |
| `429 Too Many Requests` | Rate limit / enrollment cooloff |
| `500 Internal Server Error` | Unhandled exception (sanitised — no stack trace) |
| `502 Bad Gateway` | Gateway cannot reach downstream service |
| `503 Service Unavailable` | Readiness probe failed |

---

## Error Code Reference

| Code | Status | Description |
|------|:------:|-------------|
| `VALIDATION_ERROR` | 400 | Zod schema failure — see `error.details` for field errors |
| `INVALID_YOUTUBE_ID` | 400 | YouTube URL or video ID is not valid |
| `FILE_TOO_LARGE` | 400 | Uploaded file exceeds 25 MB |
| `MISSING_TOKEN` | 401 | `Authorization: Bearer` header absent |
| `TOKEN_EXPIRED` | 401 | Firebase ID token expired (client should refresh) |
| `TOKEN_REVOKED` | 401 | Token revoked — force re-login |
| `INVALID_TOKEN` | 401 | Token signature invalid |
| `UNAUTHENTICATED` | 401 | Endpoint requires authentication |
| `WRONG_PASSWORD` | 401 | Current password incorrect on change-password |
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
| `INVALID_ROLE` | 409 | Role change not permitted (e.g. promoting non-student) |
| `ALREADY_SUSPENDED` | 409 | Account already suspended |
| `ALREADY_ACTIVE` | 409 | Account already active |
| `NO_SEMESTERS` | 422 | Cannot publish course with no semesters |
| `EMPTY_SEMESTER` | 422 | Every semester must have ≥ 1 subject before publishing |
| `COURSE_NOT_PUBLISHED` | 422 | Enrollment only allowed on published courses |
| `RESUBMIT_TOO_EARLY` | 429 | Must wait cooloff period after rejection before re-enrolling |
| `RATE_LIMIT_EXCEEDED` | 429 | General rate limit hit |
| `AUTH_RATE_LIMIT_EXCEEDED` | 429 | Auth endpoint rate limit hit |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | File type not accepted (PDF / DOC / DOCX only) |
| `INTERNAL_ERROR` | 500 | Unhandled server error (sanitised — no stack trace exposed) |
| `GATEWAY_ERROR` | 502 | Upstream microservice unreachable |

---

## Domain Events Reference

Events are published via transactional outbox — not REST-accessible. All share the envelope:
```typescript
{ id: string, type: string, occurredAt: string, requestId: string, payload: T }
```

| Event Type | Published By | Key Payload Fields | Notification Target |
|-----------|-------------|-------------------|---------------------|
| `user.registered` | auth-service | `uid`, `email`, `firstName`, `lastName` | All admins (in-app) + registering user (email) |
| `registration.approved` | enrollment-service | `studentUid`, `actorUid`, `registrationId` | Student (in-app + email) |
| `registration.rejected` | enrollment-service | `studentUid`, `actorUid`, `reason?` | Student (in-app + email) |
| `enrollment.pending` | enrollment-service | `studentUid`, `courseId`, `enrollmentId` | All admins (in-app) |
| `enrollment.approved` | enrollment-service | `studentUid`, `actorUid`, `courseId` | Student (in-app + email + push) |
| `enrollment.rejected` | enrollment-service | `studentUid`, `actorUid`, `courseId`, `reason?` | Student (in-app + email) |
| `enrollment.withdrawn` | enrollment-service | `studentUid`, `courseId` | Audit only |
| `course.published` | course-service | `actorUid`, `courseId`, `courseTitle` | Audit only |
| `progress.subjectCompleted` | progress-service | `studentUid`, `subjectId`, `courseId`, `source` | Audit only |
| `admin.created` | user-service | `uid`, `email`, `firstName`, `lastName`, `actorUid`, `promoted?` | New admin (email) |
| `admin.suspended` | user-service | `uid`, `email`, `firstName`, `lastName` | Suspended admin (in-app + email) |
| `audit.action` | any service | `actorUid?`, `action`, `targetType`, `targetId` | Audit only |

---

*CMP Backend · Future CX Lanka (Pvt) Ltd · API v1.1.0 · 11 May 2026*  
*Firebase project: `e-learning-f4209` · 57 external endpoints across 8 microservices*
