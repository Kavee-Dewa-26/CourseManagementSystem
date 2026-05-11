# CMP — Final API Reference
## Course Management Portal · Future CX Lanka (Pvt) Ltd
### Version 1.1.0 · 11 May 2026 · Firebase Project: `e-learning-f4209`

---

## Quick Reference

| | |
|---|---|
| **Local Base URL** | `http://localhost:3000/api/v1` |
| **Production Base URL** | `https://api.yourdomain.com/api/v1` |
| **Auth Header** | `Authorization: Bearer <firebase-id-token>` |
| **Content-Type** | `application/json` on POST / PATCH with body |
| **Correlation ID** | `X-Request-Id: <uuid-v4>` — optional; server generates if absent, echoed in every response |
| **Token Expiry** | Firebase ID tokens expire after 1 hour — always call `user.getIdToken()` before requests |

---

## Roles & Access

| Role | Created By | Capabilities |
|------|-----------|-------------|
| `student` | Self-registration | Own profile · course catalog · own enrollments · own progress · own notifications |
| `admin` | Super Admin via `POST /super-admin/admins` | All student capabilities + course management · enrollment queue · user management |
| `admin` *(promoted)* | Super Admin via `POST /super-admin/users/:uid/make-admin` | **Dual-role** — all admin + all student capabilities simultaneously |
| `super_admin` | Pre-seeded / service account | Everything admin + admin account management + audit log |

> `super_admin` inherits all `admin` permissions on every route.  
> Promoted admins carry `roles: ["student", "admin"]` — they pass both `student` and `admin` route guards at the same time.

---

## Response Shapes

**Single resource**
```json
{ "id": "abc123", "title": "...", "createdAt": "2026-05-01T08:00:00.000Z" }
```

**Paginated list**
```json
{ "items": [ ... ], "nextCursor": "abc123", "total": 47 }
```
`nextCursor` is `null` on the last page. Omit `cursor` on the first request.

**Empty success**
```
HTTP 204 No Content  (empty body — used for DELETE and some POSTs)
```

**Error**
```json
{
  "error": {
    "code":    "COURSE_NOT_FOUND",
    "message": "The requested course could not be found.",
    "details": { "field": ["validation message"] }
  },
  "requestId": "7f3a1c2d-4e5b-6f7a-8b9c-0d1e2f3a4b5c"
}
```
`details` is only present on `400` responses (field-level validation errors).

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

Exceeded → `429 Too Many Requests` with `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After` headers.

---

## Complete Endpoint Index

**57 external endpoints — all implemented and verified**

| # | Method | Path | Auth | Service |
|---|--------|------|------|---------|
| **2.1** | POST | `/auth/register` | Public | auth-service |
| **2.2** | POST | `/auth/logout` | Any role | auth-service |
| **2.3** | POST | `/auth/password-reset` | Public | auth-service |
| **2.4** | POST | `/auth/track-failure` | Public | auth-service |
| **3.1** | GET | `/me` | Any role | user-service |
| **3.2** | PATCH | `/me` | Any role | user-service |
| **3.3** | POST | `/me/change-password` | Any role | user-service |
| **4.1** | GET | `/courses` | Public (role-aware) | course-service |
| **4.2** | GET | `/courses/:id` | Public (role-aware) | course-service |
| **4.3** | POST | `/courses` | admin | course-service |
| **4.4** | PATCH | `/courses/:id` | admin | course-service |
| **4.5** | POST | `/courses/:id/publish` | admin | course-service |
| **4.6** | POST | `/courses/:id/unpublish` | admin | course-service |
| **4.7** | POST | `/courses/:id/archive` | admin | course-service |
| **4.8** | DELETE | `/courses/:id` | admin | course-service |
| **5.1** | POST | `/courses/:id/semesters` | admin | course-service |
| **5.2** | PATCH | `/semesters/:id` | admin | course-service |
| **5.3** | DELETE | `/semesters/:id` | admin | course-service |
| **6.1** | POST | `/semesters/:id/subjects` | admin | course-service |
| **6.2** | PATCH | `/subjects/:id` | admin | course-service |
| **6.3** | DELETE | `/subjects/:id` | admin | course-service |
| **7.1** | POST | `/subjects/:id/attachments` | admin | storage-service |
| **7.2** | GET | `/attachments/:id/download-url` | student, admin | storage-service |
| **7.3** | DELETE | `/attachments/:id` | admin | storage-service |
| **8.1** | POST | `/courses/:id/enroll` | student | enrollment-service |
| **8.2** | GET | `/me/enrollments` | student | enrollment-service |
| **8.3** | POST | `/enrollments/:id/withdraw` | student | enrollment-service |
| **9.1** | GET | `/admin/registrations` | admin | enrollment-service |
| **9.2** | POST | `/admin/registrations/:id/approve` | admin | enrollment-service |
| **9.3** | POST | `/admin/registrations/:id/reject` | admin | enrollment-service |
| **9.4** | POST | `/admin/registrations/bulk-approve` | admin | enrollment-service |
| **10.1** | GET | `/admin/enrollments` | admin | enrollment-service |
| **10.2** | POST | `/admin/enrollments/:id/approve` | admin | enrollment-service |
| **10.3** | POST | `/admin/enrollments/:id/reject` | admin | enrollment-service |
| **11.1** | POST | `/progress/subjects/:id/complete` | student | progress-service |
| **11.2** | POST | `/progress/subjects/:id/access` | student | progress-service |
| **11.3** | GET | `/me/progress/courses/:courseId` | student | progress-service |
| **11.4** | GET | `/me/progress/subjects/:subjectId` | student | progress-service |
| **11.5** | GET | `/admin/progress/courses/:courseId` | admin | progress-service |
| **12.1** | GET | `/me/notifications` | Any role | notification-service |
| **12.2** | POST | `/me/notifications/:id/read` | Any role | notification-service |
| **12.3** | POST | `/me/notifications/read-all` | Any role | notification-service |
| **13.1** | GET | `/users` | admin | user-service |
| **13.2** | GET | `/users/:uid` | admin | user-service |
| **13.3** | POST | `/users/:uid/suspend` | admin | user-service |
| **13.4** | POST | `/users/:uid/reactivate` | admin | user-service |
| **14.1** | GET | `/super-admin/admins` | super_admin | user-service |
| **14.2** | POST | `/super-admin/admins` | super_admin | user-service |
| **14.3** | GET | `/super-admin/admins/:uid` | super_admin | user-service |
| **14.4** | POST | `/super-admin/admins/:uid/suspend` | super_admin | user-service |
| **14.5** | POST | `/super-admin/admins/:uid/reactivate` | super_admin | user-service |
| **14.6** | DELETE | `/super-admin/admins/:uid` | super_admin | user-service |
| **14.7** | POST | `/super-admin/users/:uid/make-admin` | super_admin | user-service |
| **15.1** | GET | `/audit-log` | super_admin | audit-service |
| **16.1** | GET | `/healthz` | Public | all services |
| **16.2** | GET | `/readyz` | Public | all services |

---

## 2. Auth Endpoints

### 2.1 `POST /auth/register`

Register a new student account. Created in `pending_approval` state — cannot log in until an admin approves.

**Authentication:** None (public)

**Request Body:**
```json
{
  "firstName": "Viruli",
  "lastName":  "Weerasinghe",
  "email":     "viruli@example.com",
  "password":  "SecurePass@2026"
}
```

| Field | Required | Validation |
|-------|:--------:|-----------|
| `firstName` | Yes | 1–100 characters |
| `lastName` | Yes | 1–100 characters |
| `email` | Yes | Valid email format, must be unique |
| `password` | Yes | Min 10 chars · uppercase · lowercase · digit · special character |

**Responses:**

`201 Created`
```json
{ "message": "Registration submitted. Your account is pending approval." }
```

`400 Bad Request` — validation failure
```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed.", "details": { "password": ["Must include at least one uppercase letter"] } },
  "requestId": "..."
}
```

`409 Conflict` — email already registered
```json
{ "error": { "code": "EMAIL_EXISTS", "message": "This email address is already registered." }, "requestId": "..." }
```

---

### 2.2 `POST /auth/logout`

Revoke all refresh tokens for the authenticated user. Existing ID tokens remain valid until their 1-hour natural expiry.

**Authentication:** Bearer token required · **Roles:** Any

**Request Body:** None

**Responses:**

`200 OK`
```json
{ "message": "Logged out successfully." }
```

`401 Unauthorized`
```json
{ "error": { "code": "UNAUTHENTICATED", "message": "Authentication required." }, "requestId": "..." }
```

---

### 2.3 `POST /auth/password-reset`

Send a password reset email. Always returns `200` regardless of whether the email exists (prevents user enumeration).

**Authentication:** None (public)

**Request Body:**
```json
{ "email": "viruli@example.com" }
```

**Response:**

`200 OK`
```json
{ "message": "If an account exists for this email, a reset link has been sent." }
```

---

### 2.4 `POST /auth/track-failure`

Track a failed login attempt for account lockout. After 10 failures within 15 minutes the account is locked.

**Authentication:** None (public)

**Request Body:**
```json
{ "email": "viruli@example.com" }
```

**Responses:**

`200 OK`
```json
{ "attempts": 3, "locked": false }
```

`423 Locked`
```json
{ "locked": true, "unlockAt": "2026-05-11T10:15:00.000Z" }
```

---

## 3. Profile Endpoints

### 3.1 `GET /me`

Get the authenticated user's full profile.

**Authentication:** Bearer token required · **Roles:** Any

**Response:**

`200 OK`
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

> Promoted admins will show `"role": "admin"` and `"roles": ["student", "admin"]`.

---

### 3.2 `PATCH /me`

Update the authenticated user's own profile. Only the fields below may be changed — `email`, `role`, and `status` cannot be changed through this endpoint.

**Authentication:** Bearer token required · **Roles:** Any

**Request Body (all fields optional):**
```json
{
  "firstName":       "Viruli",
  "lastName":        "Weerasinghe",
  "profilePhotoUrl": "https://storage.googleapis.com/bucket/photos/new.jpg"
}
```

| Field | Validation |
|-------|-----------|
| `firstName` | 1–100 characters |
| `lastName` | 1–100 characters |
| `profilePhotoUrl` | Valid HTTPS URL or null |

**Responses:** `200 OK` — updated user object · `400 VALIDATION_ERROR`

---

### 3.3 `POST /me/change-password`

Change the authenticated user's password. Requires the current password for verification.

**Authentication:** Bearer token required · **Roles:** Any

**Request Body:**
```json
{
  "currentPassword": "OldSecurePass@2026",
  "newPassword":     "NewSecurePass@2026"
}
```

| Field | Required | Validation |
|-------|:--------:|-----------|
| `currentPassword` | Yes | Must match current password |
| `newPassword` | Yes | Min 10 chars · uppercase · lowercase · digit · special character |

**Responses:**

`200 OK`
```json
{ "message": "Password updated successfully." }
```

`401 Unauthorized` — wrong current password
```json
{ "error": { "code": "WRONG_PASSWORD", "message": "Current password is incorrect." }, "requestId": "..." }
```

---

## 4. Course Endpoints

### 4.1 `GET /courses`

List courses. Response is filtered by role.

**Authentication:** Optional · **Roles:** All (filtered by role)

- **Students / Public:** Published courses only
- **Admin / Super Admin:** All states — `draft`, `published`, `archived`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|:-------:|-------------|
| `limit` | number | 20 | Items per page (max 100) |
| `cursor` | string | — | Pagination cursor |
| `state` | string | — | Admin only: `draft` \| `published` \| `archived` |
| `q` | string | — | Search by title (partial, case-insensitive) |

**Response:**

`200 OK`
```json
{
  "items": [
    {
      "id":            "course-abc",
      "title":         "Introduction to TypeScript",
      "description":   "Learn TypeScript from scratch.",
      "coverImageUrl": "https://storage.googleapis.com/bucket/covers/ts.jpg",
      "state":         "published",
      "semesterCount": 3,
      "createdBy":     "admin-uid-xyz",
      "createdByName": "Sapna Nethmini",
      "publishedAt":   "2026-05-03T09:00:00.000Z",
      "createdAt":     "2026-05-01T08:00:00.000Z",
      "updatedAt":     "2026-05-03T09:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 5
}
```

---

### 4.2 `GET /courses/:id`

Get a single course with its full semester and subject tree.

**Authentication:** Optional · **Roles:** All (filtered by role)

- **Students / Public:** Returns `404` if course is `draft` or `archived`
- **Admin / Super Admin:** Returns the course in any state

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Course document ID |

**Response:**

`200 OK`
```json
{
  "id":            "course-abc",
  "title":         "Introduction to TypeScript",
  "description":   "Learn TypeScript from scratch.",
  "coverImageUrl": "https://storage.googleapis.com/bucket/covers/ts.jpg",
  "state":         "published",
  "semesterCount": 2,
  "createdBy":     "admin-uid-xyz",
  "createdByName": "Sapna Nethmini",
  "publishedAt":   "2026-05-03T09:00:00.000Z",
  "createdAt":     "2026-05-01T08:00:00.000Z",
  "updatedAt":     "2026-05-03T09:00:00.000Z",
  "semesters": [
    {
      "id":           "sem-001",
      "name":         "Semester 1 — Foundations",
      "sortOrder":    1,
      "subjectCount": 4,
      "subjects": [
        {
          "id":             "sub-001",
          "title":          "TypeScript Basics",
          "description":    "Variables, types, and interfaces.",
          "youtubeVideoId": "zQnBQ4tB3ZA",
          "sortOrder":      1,
          "attachments": [
            {
              "id":         "att-001",
              "fileName":   "lesson-01-notes.pdf",
              "mimeType":   "application/pdf",
              "sizeBytes":  204800,
              "uploadedAt": "2026-05-02T10:00:00.000Z"
            }
          ]
        }
      ]
    }
  ]
}
```

`404 Not Found`
```json
{ "error": { "code": "COURSE_NOT_FOUND", "message": "The requested course could not be found." }, "requestId": "..." }
```

---

### 4.3 `POST /courses`

Create a new course in `draft` state.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body:**
```json
{
  "title":         "Introduction to TypeScript",
  "description":   "A comprehensive guide to learning TypeScript from the ground up.",
  "coverImageUrl": "https://storage.googleapis.com/bucket/covers/ts.jpg"
}
```

| Field | Required | Validation |
|-------|:--------:|-----------|
| `title` | Yes | 1–200 characters, must be unique across all courses |
| `description` | Yes | 1–5000 characters |
| `coverImageUrl` | No | Valid HTTPS URL or null |

**Responses:**

`201 Created` — full course object (same shape as `GET /courses/:id`, `semesters: []`)

`409 Conflict`
```json
{ "error": { "code": "COURSE_TITLE_EXISTS", "message": "A course with this title already exists." }, "requestId": "..." }
```

---

### 4.4 `PATCH /courses/:id`

Update course metadata. All fields are optional — send only the fields to change.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body (all optional):**
```json
{
  "title":         "Introduction to TypeScript — Updated",
  "description":   "Updated description.",
  "coverImageUrl": "https://storage.googleapis.com/bucket/covers/ts-new.jpg"
}
```

**Responses:** `200 OK` — updated course object · `404 COURSE_NOT_FOUND`

---

### 4.5 `POST /courses/:id/publish`

Publish a `draft` course, making it visible in the public catalog.

**Pre-conditions (server-enforced):**
- Course must have ≥ 1 semester
- Every semester must have ≥ 1 subject

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body:** None

**Responses:**

`200 OK` — updated course object with `"state": "published"`

`409 Conflict` — course not in `draft` state
```json
{ "error": { "code": "INVALID_STATE", "message": "Only DRAFT courses can be published." }, "requestId": "..." }
```

`422 Unprocessable Entity` — business rule violation
```json
{ "error": { "code": "EMPTY_SEMESTER", "message": "Every semester must have at least one subject before publishing." }, "requestId": "..." }
```

---

### 4.6 `POST /courses/:id/unpublish`

Move a `published` course back to `draft`, hiding it from the public catalog. Enrolled students retain their enrollments but lose content access until the course is re-published.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body:** None

**Responses:** `200 OK` — course with `"state": "draft"` · `409 INVALID_STATE`

---

### 4.7 `POST /courses/:id/archive`

Archive a `published` course. Hidden from the public catalog; enrolled students retain read-only content access.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body:** None

**Responses:** `200 OK` — course with `"state": "archived"` · `409 INVALID_STATE`

---

### 4.8 `DELETE /courses/:id`

Soft-delete a course. Sets `deletedAt` timestamp — recoverable within 30 days.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `204 No Content` · `404 COURSE_NOT_FOUND`

---

## 5. Semester Endpoints

### 5.1 `POST /courses/:id/semesters`

Add a new semester to a course.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Course document ID |

**Request Body:**
```json
{
  "name":      "Semester 1 — Foundations",
  "sortOrder": 1
}
```

| Field | Required | Validation |
|-------|:--------:|-----------|
| `name` | Yes | 1–200 characters |
| `sortOrder` | Yes | Positive integer — controls display order |

**Response:**

`201 Created`
```json
{
  "id":           "sem-001",
  "courseId":     "course-abc",
  "name":         "Semester 1 — Foundations",
  "sortOrder":    1,
  "subjectCount": 0,
  "createdAt":    "2026-05-01T08:00:00.000Z",
  "updatedAt":    "2026-05-01T08:00:00.000Z"
}
```

`404 Not Found` — course does not exist

---

### 5.2 `PATCH /semesters/:id`

Update a semester's name or sort order. All fields are optional.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body (all optional):**
```json
{ "name": "Semester 1 — Core Foundations", "sortOrder": 2 }
```

**Responses:** `200 OK` — updated semester · `404 SEMESTER_NOT_FOUND`

---

### 5.3 `DELETE /semesters/:id`

Soft-delete a semester and all its subjects.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `204 No Content` · `404 SEMESTER_NOT_FOUND`

---

## 6. Subject Endpoints

### 6.1 `POST /semesters/:id/subjects`

Add a subject (lesson) to a semester.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Semester document ID |

**Request Body:**
```json
{
  "title":           "TypeScript Basics",
  "description":     "Variables, types, interfaces, and enums.",
  "youtubeVideoUrl": "https://www.youtube.com/watch?v=zQnBQ4tB3ZA",
  "sortOrder":       1
}
```

| Field | Required | Validation |
|-------|:--------:|-----------|
| `title` | Yes | 1–200 characters |
| `description` | Yes | 1–5000 characters |
| `youtubeVideoUrl` | Yes | Valid YouTube URL or 11-character video ID |
| `sortOrder` | Yes | Positive integer |

> Server extracts and stores only the 11-character YouTube video ID, regardless of URL format.

**Response:**

`201 Created`
```json
{
  "id":             "sub-001",
  "semesterId":     "sem-001",
  "title":          "TypeScript Basics",
  "description":    "Variables, types, interfaces, and enums.",
  "youtubeVideoId": "zQnBQ4tB3ZA",
  "sortOrder":      1,
  "attachments":    [],
  "createdAt":      "2026-05-01T09:00:00.000Z",
  "updatedAt":      "2026-05-01T09:00:00.000Z"
}
```

`400 Bad Request`
```json
{ "error": { "code": "INVALID_YOUTUBE_ID", "message": "The provided YouTube URL or video ID is not valid." }, "requestId": "..." }
```

`404 Not Found` — semester does not exist

---

### 6.2 `PATCH /subjects/:id`

Update subject content. All fields are optional.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body (all optional):**
```json
{
  "title":           "TypeScript Basics — Revised",
  "description":     "Updated description.",
  "youtubeVideoUrl": "https://www.youtube.com/watch?v=newVideoId1",
  "sortOrder":       2
}
```

**Responses:** `200 OK` — updated subject · `404 SUBJECT_NOT_FOUND`

---

### 6.3 `DELETE /subjects/:id`

Soft-delete a subject.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `204 No Content` · `404 SUBJECT_NOT_FOUND`

---

## 7. Attachment Endpoints

### 7.1 `POST /subjects/:id/attachments`

Upload a file attachment to a subject.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`  
**Content-Type:** `multipart/form-data` · Form field name: `file`

| Constraint | Value |
|-----------|-------|
| Accepted types | PDF · DOC · DOCX |
| Max file size | 25 MB |

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Subject document ID |

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/subjects/sub-001/attachments \
  -H "Authorization: Bearer <token>" \
  -F "file=@lesson-notes.pdf"
```

**Response:**

`201 Created`
```json
{
  "id":         "att-001",
  "subjectId":  "sub-001",
  "fileName":   "lesson-notes.pdf",
  "mimeType":   "application/pdf",
  "sizeBytes":  204800,
  "uploadedBy": "admin-uid-xyz",
  "uploadedAt": "2026-05-02T10:00:00.000Z"
}
```

`400 Bad Request` — file too large
```json
{ "error": { "code": "FILE_TOO_LARGE", "message": "File size exceeds the 25 MB limit." }, "requestId": "..." }
```

`415 Unsupported Media Type`
```json
{ "error": { "code": "UNSUPPORTED_MEDIA_TYPE", "message": "File type 'image/png' is not allowed. Accepted: PDF, DOC, DOCX." }, "requestId": "..." }
```

---

### 7.2 `GET /attachments/:id/download-url`

Get a short-lived signed download URL for an attachment. URL expires in **15 minutes**.

> Students require an **approved** enrollment in the parent course to download attachments.

**Authentication:** Bearer token required · **Roles:** `student` (with approved enrollment), `admin`, `super_admin`

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Attachment document ID |

**Response:**

`200 OK`
```json
{
  "downloadUrl": "https://storage.googleapis.com/bucket/attachments/att-001.pdf?X-Goog-Signature=...",
  "expiresAt":   "2026-05-07T10:15:00.000Z"
}
```

`403 Forbidden`
```json
{ "error": { "code": "ENROLLMENT_REQUIRED", "message": "An approved enrollment is required to download attachments." }, "requestId": "..." }
```

---

### 7.3 `DELETE /attachments/:id`

Remove an attachment from Cloud Storage and from the subject's attachment list.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Responses:** `204 No Content` · `404 ATTACHMENT_NOT_FOUND`

---

## 8. Enrollment Endpoints — Student

### 8.1 `POST /courses/:id/enroll`

Submit an enrollment request for a published course. Enters `pending` state until an admin approves or rejects it.

**Authentication:** Bearer token required · **Roles:** `student`

**Constraints:**
- Course must be in `published` state
- Student account must be `approved`
- Maximum 1 pending or approved enrollment per course at a time

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Course document ID |

**Request Body:** None

**Response:**

`201 Created`
```json
{
  "id":          "uid-abc_course-abc",
  "courseId":    "course-abc",
  "courseTitle": "Introduction to TypeScript",
  "studentUid":  "firebase-uid-abc123",
  "state":       "pending",
  "createdAt":   "2026-05-05T08:00:00.000Z",
  "updatedAt":   "2026-05-05T08:00:00.000Z"
}
```

`409 Conflict`
```json
{ "error": { "code": "ENROLLMENT_EXISTS", "message": "You already have a pending or approved enrollment for this course." }, "requestId": "..." }
```

`422 Unprocessable Entity`
```json
{ "error": { "code": "COURSE_NOT_PUBLISHED", "message": "Enrollment is only available for published courses." }, "requestId": "..." }
```

`429 Too Many Requests` — resubmitting before cooloff period
```json
{ "error": { "code": "RESUBMIT_TOO_EARLY", "message": "You must wait 24 hours after a rejection before resubmitting." }, "requestId": "..." }
```

---

### 8.2 `GET /me/enrollments`

List the authenticated student's enrollments.

**Authentication:** Bearer token required · **Roles:** `student`

**Query Parameters:**

| Param | Description |
|-------|-------------|
| `state` | Filter: `pending` \| `approved` \| `rejected` \| `withdrawn` |
| `limit` | Items per page (default 20) |
| `cursor` | Pagination cursor |

**Response:**

`200 OK`
```json
{
  "items": [
    {
      "id":          "enr-abc",
      "courseId":    "course-abc",
      "courseTitle": "Introduction to TypeScript",
      "state":       "approved",
      "approvedAt":  "2026-05-06T09:00:00.000Z",
      "createdAt":   "2026-05-05T08:00:00.000Z",
      "updatedAt":   "2026-05-06T09:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 3
}
```

---

### 8.3 `POST /enrollments/:id/withdraw`

Withdraw a `pending` enrollment request. Only `pending` enrollments may be withdrawn.

**Authentication:** Bearer token required · **Roles:** `student`

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Enrollment document ID |

**Request Body:** None

**Responses:**

`200 OK` — enrollment with `"state": "withdrawn"`

`409 Conflict`
```json
{ "error": { "code": "INVALID_STATE", "message": "Only pending enrollments can be withdrawn." }, "requestId": "..." }
```

---

## 9. Registration Queue — Admin

### 9.1 `GET /admin/registrations`

List student registration requests.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Query Parameters:**

| Param | Description |
|-------|-------------|
| `status` | Filter (default `pending`): `pending` \| `approved` \| `rejected` |
| `q` | Search by student name or email |
| `limit` | Items per page (default 25) |
| `cursor` | Pagination cursor |

**Response:**

`200 OK`
```json
{
  "items": [
    {
      "id":          "reg-001",
      "studentUid":  "firebase-uid-abc123",
      "firstName":   "Viruli",
      "lastName":    "Weerasinghe",
      "email":       "viruli@example.com",
      "status":      "pending",
      "submittedAt": "2026-05-05T08:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 12
}
```

---

### 9.2 `POST /admin/registrations/:id/approve`

Approve a pending student registration. Sets student account status → `approved`. Sends email + in-app notification to the student.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Registration document ID (= student UID) |

**Request Body:** None

**Responses:**

`200 OK`
```json
{ "message": "Registration approved.", "studentUid": "firebase-uid-abc123" }
```

`409 Conflict`
```json
{ "error": { "code": "INVALID_STATE", "message": "Registration is no longer pending." }, "requestId": "..." }
```

---

### 9.3 `POST /admin/registrations/:id/reject`

Reject a pending student registration. Sends email + in-app notification with the optional reason.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body (optional):**
```json
{ "reason": "Incomplete registration information." }
```

| Field | Validation |
|-------|-----------|
| `reason` | Optional, max 500 characters |

**Response:**

`200 OK`
```json
{ "message": "Registration rejected.", "studentUid": "firebase-uid-abc123" }
```

---

### 9.4 `POST /admin/registrations/bulk-approve`

Approve multiple pending registrations in one request. Uses `Promise.allSettled` — partial success is possible.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body:**
```json
{ "ids": ["reg-001", "reg-002", "reg-003"] }
```

| Field | Validation |
|-------|-----------|
| `ids` | Array of registration IDs, 1–100 per request |

**Response:**

`200 OK`
```json
{
  "approved": ["reg-001", "reg-003"],
  "failed": [
    { "id": "reg-002", "reason": "Registration is no longer pending." }
  ]
}
```

---

## 10. Enrollment Queue — Admin

### 10.1 `GET /admin/enrollments`

List course enrollment requests.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Query Parameters:**

| Param | Description |
|-------|-------------|
| `status` | Filter (default `pending`): `pending` \| `approved` \| `rejected` |
| `courseId` | Filter by specific course |
| `limit` | Items per page (default 25) |
| `cursor` | Pagination cursor |

**Response:**

`200 OK`
```json
{
  "items": [
    {
      "id":           "enr-abc",
      "studentUid":   "firebase-uid-abc123",
      "studentName":  "Viruli Weerasinghe",
      "studentEmail": "viruli@example.com",
      "courseId":     "course-abc",
      "courseTitle":  "Introduction to TypeScript",
      "state":        "pending",
      "submittedAt":  "2026-05-05T08:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 5
}
```

---

### 10.2 `POST /admin/enrollments/:id/approve`

Approve a pending enrollment. Grants the student access to course content. Sends in-app + email + push notification.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Enrollment document ID |

**Request Body:** None

**Response:**

`200 OK`
```json
{
  "id":         "enr-abc",
  "courseId":   "course-abc",
  "state":      "approved",
  "approvedAt": "2026-05-06T09:00:00.000Z"
}
```

`409 Conflict`
```json
{ "error": { "code": "INVALID_STATE", "message": "Enrollment is no longer pending." }, "requestId": "..." }
```

---

### 10.3 `POST /admin/enrollments/:id/reject`

Reject a pending enrollment. After rejection, the student cannot re-enroll for `ENROLLMENT_REJECTION_COOLOFF_HOURS` (default 24 h).

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body (optional):**
```json
{ "reason": "This course is currently at full capacity." }
```

**Response:**

`200 OK`
```json
{
  "id":         "enr-abc",
  "courseId":   "course-abc",
  "state":      "rejected",
  "rejectedAt": "2026-05-06T09:00:00.000Z",
  "reason":     "This course is currently at full capacity."
}
```

---

## 11. Progress Endpoints

### 11.1 `POST /progress/subjects/:id/complete`

Mark a subject as completed. **Idempotent** — if already `completed`, returns the existing record unchanged. `completedAt` is immutable once set.

**Authentication:** Bearer token required · **Roles:** `student`

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `id` | Subject document ID |

**Request Body:**
```json
{
  "courseId":   "course-abc",
  "semesterId": "sem-001"
}
```

| Field | Required |
|-------|:--------:|
| `courseId` | Yes |
| `semesterId` | Yes |

**Response:**

`200 OK`
```json
{
  "studentUid":       "firebase-uid-abc123",
  "subjectId":        "sub-001",
  "courseId":         "course-abc",
  "semesterId":       "sem-001",
  "state":            "completed",
  "completionSource": "manual",
  "completedAt":      "2026-05-07T14:00:00.000Z",
  "lastAccessedAt":   "2026-05-07T14:00:00.000Z"
}
```

---

### 11.2 `POST /progress/subjects/:id/access`

Update the `lastAccessedAt` timestamp for a subject. Powers the "Continue Learning" resume feature.

**Authentication:** Bearer token required · **Roles:** `student`

**Request Body:**
```json
{ "courseId": "course-abc", "semesterId": "sem-001" }
```

**Response:**

`200 OK`
```json
{ "subjectId": "sub-001", "lastAccessedAt": "2026-05-07T14:30:00.000Z" }
```

---

### 11.3 `GET /me/progress/courses/:courseId`

Get the authenticated student's progress aggregate for a course.

**Authentication:** Bearer token required · **Roles:** `student`

**Response:**

`200 OK`
```json
{
  "courseId":              "course-abc",
  "studentUid":            "firebase-uid-abc123",
  "totalSubjects":         10,
  "completedCount":        4,
  "pendingCount":          6,
  "completionPercent":     40.0,
  "lastAccessedSubjectId": "sub-004"
}
```

| Field | Description |
|-------|-------------|
| `completionPercent` | Rounded to 1 decimal place (e.g., `33.3`) |
| `lastAccessedSubjectId` | Subject to resume from; `null` if no subjects accessed |

---

### 11.4 `GET /me/progress/subjects/:subjectId`

Get the authenticated student's progress for a specific subject.

**Authentication:** Bearer token required · **Roles:** `student`

**Responses:**

`200 OK`
```json
{
  "studentUid":       "firebase-uid-abc123",
  "subjectId":        "sub-001",
  "courseId":         "course-abc",
  "semesterId":       "sem-001",
  "state":            "completed",
  "completionSource": "auto",
  "completedAt":      "2026-05-07T14:00:00.000Z",
  "lastAccessedAt":   "2026-05-07T14:00:00.000Z"
}
```

`404 Not Found` — student has not accessed this subject yet

---

### 11.5 `GET /admin/progress/courses/:courseId`

Get aggregated progress statistics for all students enrolled in a course.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Query Parameters:** `limit`, `cursor`

**Response:**

`200 OK`
```json
{
  "courseId":      "course-abc",
  "courseTitle":   "Introduction to TypeScript",
  "totalSubjects": 10,
  "enrolledCount": 25,
  "items": [
    {
      "studentUid":        "firebase-uid-abc123",
      "studentName":       "Viruli Weerasinghe",
      "completedCount":    4,
      "completionPercent": 40.0,
      "lastAccessedAt":    "2026-05-07T14:30:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 25
}
```

---

## 12. Notification Endpoints

### 12.1 `GET /me/notifications`

List the authenticated user's in-app notifications, newest first.

**Authentication:** Bearer token required · **Roles:** Any

**Query Parameters:**

| Param | Description |
|-------|-------------|
| `unreadOnly` | `true` returns only unread notifications (default `false`) |
| `limit` | Items per page (default 20) |
| `cursor` | Pagination cursor |

**Response:**

`200 OK`
```json
{
  "items": [
    {
      "id":        "notif-001",
      "userUid":   "firebase-uid-abc123",
      "category":  "enrollment_approved",
      "title":     "Enrollment Approved",
      "body":      "Your enrollment in 'Introduction to TypeScript' has been approved.",
      "payload":   { "courseId": "course-abc", "enrollmentId": "enr-abc" },
      "readAt":    null,
      "createdAt": "2026-05-06T09:05:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 3,
  "unreadCount": 2
}
```

---

### 12.2 `POST /me/notifications/:id/read`

Mark a single notification as read.

**Authentication:** Bearer token required · **Roles:** Any

**Request Body:** None

**Response:**

`200 OK`
```json
{ "id": "notif-001", "readAt": "2026-05-07T10:00:00.000Z" }
```

---

### 12.3 `POST /me/notifications/read-all`

Mark all notifications for the authenticated user as read.

**Authentication:** Bearer token required · **Roles:** Any

**Request Body:** None

**Response:**

`200 OK`
```json
{ "markedCount": 3 }
```

---

## 13. User Management — Admin

### 13.1 `GET /users`

List all users in the system.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Query Parameters:**

| Param | Description |
|-------|-------------|
| `status` | Filter: `pending_approval` \| `approved` \| `rejected` \| `suspended` |
| `role` | Filter by role (default `student`) |
| `courseId` | Filter students enrolled in a specific course |
| `q` | Search by name or email (partial match) |
| `limit` | Items per page (default 25, max 100) |
| `cursor` | Pagination cursor |

**Response:**

`200 OK`
```json
{
  "items": [
    {
      "uid":             "firebase-uid-abc123",
      "email":           "viruli@example.com",
      "role":            "student",
      "roles":           ["student"],
      "status":          "approved",
      "firstName":       "Viruli",
      "lastName":        "Weerasinghe",
      "enrolledCourses": 2,
      "createdAt":       "2026-05-01T08:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 47
}
```

---

### 13.2 `GET /users/:uid`

Get a specific user's full profile including enrollment history and per-course progress summary.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `uid` | Firebase Auth UID |

**Response:**

`200 OK`
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
  "enrollments": [
    {
      "courseId":          "course-abc",
      "courseTitle":       "Introduction to TypeScript",
      "enrollmentState":   "approved",
      "completionPercent": 40.0,
      "approvedAt":        "2026-05-06T09:00:00.000Z"
    }
  ]
}
```

---

### 13.3 `POST /users/:uid/suspend`

Suspend a student's account. Disables Firebase Auth account + revokes all refresh tokens.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body (optional):**
```json
{ "reason": "Violation of platform terms of service." }
```

**Responses:**

`200 OK`
```json
{ "uid": "firebase-uid-abc123", "status": "suspended" }
```

`409 Conflict`
```json
{ "error": { "code": "ALREADY_SUSPENDED", "message": "This account is already suspended." }, "requestId": "..." }
```

---

### 13.4 `POST /users/:uid/reactivate`

Reactivate a suspended student's account.

**Authentication:** Bearer token required · **Roles:** `admin`, `super_admin`

**Request Body:** None

**Responses:**

`200 OK`
```json
{ "uid": "firebase-uid-abc123", "status": "approved" }
```

`409 Conflict`
```json
{ "error": { "code": "ALREADY_ACTIVE", "message": "This account is already active." }, "requestId": "..." }
```

---

## 14. Admin Management — Super Admin

### 14.1 `GET /super-admin/admins`

List all admin accounts.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Query Parameters:**

| Param | Description |
|-------|-------------|
| `status` | Filter: `approved` \| `suspended` |
| `q` | Search by name or email |
| `limit` | Items per page (default 25) |
| `cursor` | Pagination cursor |

**Response:**

`200 OK`
```json
{
  "items": [
    {
      "uid":       "admin-uid-xyz",
      "email":     "sapna@example.com",
      "role":      "admin",
      "roles":     ["admin"],
      "status":    "approved",
      "firstName": "Sapna",
      "lastName":  "Nethmini",
      "createdAt": "2026-01-10T08:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 3
}
```

---

### 14.2 `POST /super-admin/admins`

Create a new admin account. The account is immediately `approved`. Login credentials email is sent to the new admin.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Request Body:**
```json
{
  "firstName":       "Sapna",
  "lastName":        "Nethmini",
  "email":           "sapna@example.com",
  "initialPassword": "TempPass@2026!"
}
```

| Field | Required | Validation |
|-------|:--------:|-----------|
| `firstName` | Yes | 1–100 characters |
| `lastName` | Yes | 1–100 characters |
| `email` | Yes | Valid email, must be unique |
| `initialPassword` | Yes | Min 10 chars · complexity rules |

**Response:**

`201 Created`
```json
{
  "uid":       "admin-uid-xyz",
  "email":     "sapna@example.com",
  "role":      "admin",
  "roles":     ["admin"],
  "status":    "approved",
  "firstName": "Sapna",
  "lastName":  "Nethmini",
  "createdAt": "2026-05-07T08:00:00.000Z"
}
```

`409 Conflict`
```json
{ "error": { "code": "EMAIL_EXISTS", "message": "Email address already registered." }, "requestId": "..." }
```

---

### 14.3 `GET /super-admin/admins/:uid`

Get a specific admin's full profile.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Responses:** `200 OK` — full user object · `404 USER_NOT_FOUND`

---

### 14.4 `POST /super-admin/admins/:uid/suspend`

Suspend an admin account. Disables Firebase Auth + revokes all tokens. Publishes `admin.suspended` event — suspended admin receives an email.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Request Body (optional):**
```json
{ "reason": "Under review." }
```

**Response:**

`200 OK`
```json
{
  "uid":             "admin-uid-xyz",
  "email":           "sapna@example.com",
  "firstName":       "Sapna",
  "lastName":        "Nethmini",
  "role":            "admin",
  "roles":           ["admin"],
  "status":          "suspended",
  "profilePhotoUrl": null,
  "createdAt":       "2026-05-11T04:49:06.197Z",
  "updatedAt":       "2026-05-11T05:15:02.254Z",
  "deletedAt":       null
}
```

`404 Not Found`
```json
{ "error": { "code": "USER_NOT_FOUND", "message": "User not found." }, "requestId": "..." }
```

---

### 14.5 `POST /super-admin/admins/:uid/reactivate`

Reactivate a suspended admin account. Re-enables the Firebase Auth account.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Request Body:** None

**Response:**

`200 OK`
```json
{
  "uid":             "admin-uid-xyz",
  "email":           "sapna@example.com",
  "firstName":       "Sapna",
  "lastName":        "Nethmini",
  "role":            "admin",
  "roles":           ["admin"],
  "status":          "approved",
  "profilePhotoUrl": null,
  "createdAt":       "2026-05-11T04:49:06.197Z",
  "updatedAt":       "2026-05-11T05:15:06.084Z",
  "deletedAt":       null
}
```

---

### 14.6 `DELETE /super-admin/admins/:uid`

Soft-delete an admin account. Sets `deletedAt`; Firebase Auth account disabled. Only `role: "admin"` accounts — attempting a `super_admin` or `student` UID returns `404`.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Request Body:** None

**Responses:** `204 No Content` · `404 USER_NOT_FOUND`

---

### 14.7 `POST /super-admin/users/:uid/make-admin`

Promote a student account to admin. The promoted user **retains their student role** alongside admin (**dual-role**) — they can manage courses as an admin and enroll in courses as a student within the same session.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Path Parameters:**

| Param | Description |
|-------|-------------|
| `uid` | Firebase Auth UID of the student to promote |

**What changes on promotion:**
- `role` → `"admin"` (primary role)
- `roles` → `["student", "admin"]`
- `status` → `"approved"`
- Firebase custom claim updated immediately

**Constraints:** Only `role: "student"` accounts. Already `admin` or `super_admin` returns `409`.

**Side effect:** Publishes `admin.created` event with `promoted: true` — promotion email sent to the user.

**Request Body:** None

**Response:**

`200 OK`
```json
{
  "uid":             "student-uid-abc",
  "email":           "alice@test.com",
  "firstName":       "Alice",
  "lastName":        "Cooper",
  "role":            "admin",
  "roles":           ["student", "admin"],
  "status":          "approved",
  "profilePhotoUrl": null,
  "createdAt":       "2026-05-11T06:05:46.338Z",
  "updatedAt":       "2026-05-11T06:06:09.447Z",
  "deletedAt":       null
}
```

> Existing enrollments, progress records, and notifications are preserved. The promoted admin can immediately use all student features under the same account.

`404 Not Found`
```json
{ "error": { "code": "USER_NOT_FOUND", "message": "User not found." }, "requestId": "..." }
```

`409 Conflict`
```json
{ "error": { "code": "INVALID_ROLE", "message": "Only student accounts can be promoted to admin." }, "requestId": "..." }
```

---

## 15. Audit Log — Super Admin

### 15.1 `GET /audit-log`

Retrieve the append-only system audit log. All records are immutable once written.

**Authentication:** Bearer token required · **Roles:** `super_admin`

**Query Parameters:**

| Param | Description |
|-------|-------------|
| `actorUid` | Filter by the UID of the actor who performed the action |
| `action` | Filter by action type (e.g., `registration.approved`) |
| `targetType` | Filter by entity type: `user` \| `course` \| `enrollment` \| `registration` \| `admin` \| `subject` |
| `targetId` | Filter by specific resource ID |
| `from` | ISO 8601 start date |
| `to` | ISO 8601 end date |
| `limit` | Items per page (default 20, max 100) |
| `cursor` | Pagination cursor |

**Response:**

`200 OK`
```json
{
  "items": [
    {
      "id":         "audit-001",
      "actorUid":   "admin-uid-xyz",
      "actorEmail": "sapna@example.com",
      "action":     "registration.approved",
      "targetType": "registration",
      "targetId":   "reg-001",
      "payload":    { "studentUid": "firebase-uid-abc123" },
      "requestId":  "7f3a1c2d-4e5b-6f7a-8b9c-0d1e2f3a4b5c",
      "createdAt":  "2026-05-06T09:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 142
}
```

| Field | Description |
|-------|-------------|
| `actorUid` | UID of the user who performed the action; `null` for system-generated events |
| `action` | Event type string (see Domain Events section) |
| `targetType` | Entity type acted on |
| `requestId` | End-to-end correlation ID |

---

## 16. Health Endpoints

Available directly on each service (`http://[service-host]:[port]`) — not proxied through gateway.

### 16.1 `GET /healthz`

Liveness probe — checks that the service process is running.

**Authentication:** None

**Response:**

`200 OK`
```json
{ "status": "ok", "service": "course-service", "ts": 1746684000000 }
```

---

### 16.2 `GET /readyz`

Readiness probe — checks that the service is ready to handle traffic (Firestore connectivity verified).

**Authentication:** None

**Response:**

`200 OK`
```json
{ "status": "ready" }
```

`503 Service Unavailable`
```json
{ "status": "not_ready", "error": "Firestore unreachable" }
```

---

## 17. Data Models

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
  createdAt:       string;   // ISO 8601
  updatedAt:       string;
  deletedAt:       string | null;  // set on soft-delete
}
```
> `roles` is the authoritative set used by authorization middleware. `role` is the primary role for display.

---

### Course
```typescript
interface Course {
  id:             string;
  title:          string;
  titleSlug:      string;           // URL-friendly version of title
  description:    string;
  coverImageUrl:  string | null;
  state:          'draft' | 'published' | 'archived';
  createdBy:      string;           // Admin UID
  createdByName:  string;           // Admin display name
  semesterCount:  number;
  publishedAt:    string | null;    // null if never published
  createdAt:      string;
  updatedAt:      string;
  deletedAt:      string | null;
  semesters?:     Semester[];       // only in GET /courses/:id
}
```

---

### Semester
```typescript
interface Semester {
  id:           string;
  courseId:     string;
  name:         string;
  sortOrder:    number;
  subjectCount: number;
  createdAt:    string;
  updatedAt:    string;
  subjects?:    Subject[];  // only in GET /courses/:id
}
```

---

### Subject
```typescript
interface Subject {
  id:             string;
  semesterId:     string;
  title:          string;
  description:    string;
  youtubeVideoId: string;   // 11-character YouTube video ID
  sortOrder:      number;
  attachments:    Attachment[];
  createdAt:      string;
  updatedAt:      string;
}
```

---

### Attachment
```typescript
interface Attachment {
  id:          string;
  subjectId:   string;
  fileName:    string;      // original file name
  mimeType:    string;      // 'application/pdf' | 'application/msword' | ...
  sizeBytes:   number;
  uploadedBy:  string;      // Admin UID
  uploadedAt:  string;
  // storagePath is internal — NOT exposed to clients
}
```

---

### Enrollment
```typescript
interface Enrollment {
  id:          string;   // composite: `${studentUid}_${courseId}`
  studentUid:  string;
  courseId:    string;
  courseTitle: string;
  state:       'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvedAt?: string;
  rejectedAt?: string;
  reason?:     string;
  createdAt:   string;
  updatedAt:   string;
}
```

---

### SubjectProgress
```typescript
interface SubjectProgress {
  studentUid:        string;
  subjectId:         string;
  courseId:          string;
  semesterId:        string;
  state:             'not_started' | 'in_progress' | 'completed';
  completionSource?: 'manual' | 'auto';
  completedAt?:      string;   // immutable once set
  lastAccessedAt?:   string;
}
```

---

### CourseProgressAggregate
```typescript
interface CourseProgressAggregate {
  courseId:               string;
  studentUid:             string;
  totalSubjects:          number;
  completedCount:         number;
  pendingCount:           number;
  completionPercent:      number;   // 0.0–100.0, 1 decimal place
  lastAccessedSubjectId:  string | null;
}
```

---

### Notification
```typescript
interface Notification {
  id:        string;
  userUid:   string;
  category:  'registration_approved' | 'registration_rejected'
           | 'enrollment_pending' | 'enrollment_approved' | 'enrollment_rejected'
           | 'course_published' | 'system';
  title:     string;
  body:      string;
  payload:   Record<string, unknown>;
  readAt:    string | null;
  createdAt: string;
}
```

---

### AuditLogEntry
```typescript
interface AuditLogEntry {
  id:         string;
  actorUid:   string | null;   // null for system events
  actorEmail: string | null;
  action:     string;          // e.g. 'registration.approved'
  targetType: string;          // 'user' | 'course' | 'enrollment' | ...
  targetId:   string;
  payload:    Record<string, unknown>;
  requestId:  string;
  createdAt:  string;          // immutable — append-only
}
```

---

## 18. HTTP Status Codes

| Status | When Used |
|--------|-----------|
| `200 OK` | Successful GET, PATCH, POST returning data |
| `201 Created` | POST that creates a new resource |
| `204 No Content` | DELETE / logout / read-all notifications |
| `400 Bad Request` | Zod validation failure / bad file |
| `401 Unauthorized` | Missing / expired / revoked token |
| `403 Forbidden` | Valid token but wrong role or missing enrollment |
| `404 Not Found` | Entity not found / DRAFT course accessed by student |
| `409 Conflict` | Duplicate resource / invalid state transition |
| `415 Unsupported Media Type` | Wrong file type on upload |
| `422 Unprocessable Entity` | Business rule violation (publish with no subjects, enroll in unpublished course) |
| `423 Locked` | Account locked after too many login failures |
| `429 Too Many Requests` | Rate limit exceeded / enrollment cooloff |
| `500 Internal Server Error` | Unhandled exception (sanitised — no stack trace) |
| `502 Bad Gateway` | Gateway cannot reach downstream service |
| `503 Service Unavailable` | Service readiness check failed |

---

## 19. Error Code Reference

| Code | Status | Description |
|------|:------:|-------------|
| `VALIDATION_ERROR` | 400 | Zod schema failure — see `error.details` for field errors |
| `INVALID_YOUTUBE_ID` | 400 | YouTube URL or video ID is not valid |
| `FILE_TOO_LARGE` | 400 | Uploaded file exceeds 25 MB |
| `MISSING_TOKEN` | 401 | `Authorization: Bearer` header absent |
| `TOKEN_EXPIRED` | 401 | Firebase ID token expired — client should refresh |
| `TOKEN_REVOKED` | 401 | Firebase ID token revoked — force re-login |
| `INVALID_TOKEN` | 401 | Token signature invalid or cannot be verified |
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
| `COURSE_TITLE_EXISTS` | 409 | A course with this title already exists |
| `ENROLLMENT_EXISTS` | 409 | Student already has a pending or approved enrollment |
| `INVALID_STATE` | 409 | Operation not valid for the resource's current state |
| `INVALID_ROLE` | 409 | Role change not permitted (e.g. promoting a non-student) |
| `ALREADY_SUSPENDED` | 409 | Account is already suspended |
| `ALREADY_ACTIVE` | 409 | Account is already active |
| `NO_SEMESTERS` | 422 | Cannot publish a course with no semesters |
| `EMPTY_SEMESTER` | 422 | Every semester must have ≥ 1 subject before publishing |
| `COURSE_NOT_PUBLISHED` | 422 | Enrollment only allowed on published courses |
| `RESUBMIT_TOO_EARLY` | 429 | Must wait cooloff period after rejection before re-enrolling |
| `RATE_LIMIT_EXCEEDED` | 429 | General rate limit hit |
| `AUTH_RATE_LIMIT_EXCEEDED` | 429 | Auth endpoint rate limit hit |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | File type not accepted — PDF, DOC, DOCX only |
| `INTERNAL_ERROR` | 500 | Unhandled server error — sanitised, no stack trace |
| `GATEWAY_ERROR` | 502 | Upstream microservice unreachable |

---

## 20. Domain Events Reference

Events are published via the **transactional outbox** — not directly accessible via REST API. Consumed by notification-service and audit-service.

All events share this envelope:
```typescript
interface DomainEvent<T = Record<string, unknown>> {
  id:         string;   // UUID v4
  type:       string;   // event type string
  occurredAt: string;   // ISO 8601
  requestId:  string;   // correlation ID from X-Request-Id
  payload:    T;
}
```

### Event Catalogue

| Event Type | Published By | Key Payload Fields | Notification Target |
|-----------|-------------|-------------------|---------------------|
| `user.registered` | auth-service | `uid`, `email`, `firstName`, `lastName` | All admins (in-app) + registering user (email) |
| `registration.approved` | enrollment-service | `studentUid`, `actorUid`, `registrationId` | Student (in-app + email) |
| `registration.rejected` | enrollment-service | `studentUid`, `actorUid`, `registrationId`, `reason?` | Student (in-app + email) |
| `enrollment.pending` | enrollment-service | `studentUid`, `courseId`, `enrollmentId` | All admins (in-app) |
| `enrollment.approved` | enrollment-service | `studentUid`, `actorUid`, `courseId`, `enrollmentId` | Student (in-app + email + push) |
| `enrollment.rejected` | enrollment-service | `studentUid`, `actorUid`, `courseId`, `reason?` | Student (in-app + email) |
| `enrollment.withdrawn` | enrollment-service | `studentUid`, `courseId` | Audit only |
| `course.published` | course-service | `actorUid`, `courseId`, `courseTitle` | Audit only |
| `progress.subjectCompleted` | progress-service | `studentUid`, `subjectId`, `courseId`, `source` | Audit only |
| `admin.created` | user-service | `uid`, `email`, `firstName`, `lastName`, `actorUid`, `promoted?` | New admin (email) |
| `admin.suspended` | user-service | `uid`, `email`, `firstName`, `lastName` | Suspended admin (in-app + email) |
| `audit.action` | any service | `actorUid?`, `action`, `targetType`, `targetId`, `payload` | Audit only |

### Notification Triggers Summary

| Event | Notified Party | Channel |
|-------|---------------|---------|
| `user.registered` | All admins | In-app |
| `user.registered` | Registering student | Email |
| `registration.approved` | Student | In-app + Email |
| `registration.rejected` | Student | In-app + Email |
| `enrollment.pending` | All admins | In-app |
| `enrollment.approved` | Student | In-app + Email + Push |
| `enrollment.rejected` | Student | In-app + Email |
| `admin.created` | New admin | Email |
| `admin.suspended` | Suspended admin | In-app + Email |

---

## 21. Service Port Reference

| Service | Port | Purpose |
|---------|:----:|---------|
| gateway | 3000 | Single entry point — all public API requests |
| auth-service | 3001 | Token verification, registration, logout, lockout |
| user-service | 3002 | User profiles, admin management, account lifecycle |
| course-service | 3003 | Courses → Semesters → Subjects |
| enrollment-service | 3004 | Registration queue, enrollment approvals |
| progress-service | 3005 | Subject completion, course progress aggregates |
| storage-service | 3006 | File upload/download, signed URLs |
| notification-service | 3007 | In-app notifications, email, push |
| audit-service | 3008 | Append-only audit log |
| outbox-worker | — | Background daemon — no HTTP port |

> All requests go through the **gateway on port 3000**. Direct service ports are internal only.

---

*CMP Backend · Future CX Lanka (Pvt) Ltd*  
*API v1.1.0 · 11 May 2026 · Firebase: `e-learning-f4209` · 57 endpoints across 8 microservices*
