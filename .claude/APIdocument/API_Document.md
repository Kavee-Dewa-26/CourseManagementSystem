# CMP — API Reference Document
## Course Management Portal · `slp-backend`
### REST API · Version 1.0 · Base URL: `https://api.yourdomain.com/api/v1`

**Version:** 1.1.0
**Date:** 11 May 2026
**Organisation:** Future CX Lanka (Pvt) Ltd
**Status:** Release Baseline

---

## Table of Contents

1. [Getting Started](#1-getting-started)
   - 1.1 [Base URL & Versioning](#11-base-url--versioning)
   - 1.2 [Authentication](#12-authentication)
   - 1.3 [Request Format](#13-request-format)
   - 1.4 [Response Format](#14-response-format)
   - 1.5 [Error Format](#15-error-format)
   - 1.6 [Pagination](#16-pagination)
   - 1.7 [Rate Limiting](#17-rate-limiting)
   - 1.8 [Role Summary](#18-role-summary)
2. [Auth Endpoints](#2-auth-endpoints)
   - 2.1 [Register](#21-post-authregister)
   - 2.2 [Logout](#22-post-authlogout)
   - 2.3 [Password Reset](#23-post-authpassword-reset)
3. [Profile Endpoints (Me)](#3-profile-endpoints-me)
   - 3.1 [Get Own Profile](#31-get-me)
   - 3.2 [Update Own Profile](#32-patch-me)
   - 3.3 [Change Password](#33-post-mechange-password)
4. [Course Endpoints](#4-course-endpoints)
   - 4.1 [List Published Courses (Public)](#41-get-courses)
   - 4.2 [Get Course by ID](#42-get-coursesid)
   - 4.3 [Create Course (Admin)](#43-post-courses)
   - 4.4 [Update Course (Admin)](#44-patch-coursesid)
   - 4.5 [Publish Course (Admin)](#45-post-coursesidpublish)
   - 4.6 [Unpublish Course (Admin)](#46-post-coursesidunpublish)
   - 4.7 [Archive Course (Admin)](#47-post-coursesidarchive)
   - 4.8 [Delete Course (Admin)](#48-delete-coursesid)
5. [Semester Endpoints](#5-semester-endpoints)
   - 5.1 [Create Semester](#51-post-coursesidsemesters)
   - 5.2 [Update Semester](#52-patch-semestersid)
   - 5.3 [Delete Semester](#53-delete-semestersid)
6. [Subject Endpoints](#6-subject-endpoints)
   - 6.1 [Create Subject](#61-post-semestersidsubjects)
   - 6.2 [Update Subject](#62-patch-subjectsid)
   - 6.3 [Delete Subject](#63-delete-subjectsid)
7. [Attachment Endpoints](#7-attachment-endpoints)
   - 7.1 [Upload Attachment](#71-post-subjectsidattachments)
   - 7.2 [Get Download URL](#72-get-attachmentsiddownload-url)
   - 7.3 [Delete Attachment](#73-delete-attachmentsid)
8. [Enrollment Endpoints — Student](#8-enrollment-endpoints--student)
   - 8.1 [Enroll in Course](#81-post-coursesididenroll)
   - 8.2 [List My Enrollments](#82-get-meenrollments)
   - 8.3 [Withdraw Enrollment](#83-post-enrollmentsidwithdraw)
9. [Registration Queue — Admin](#9-registration-queue--admin)
   - 9.1 [List Pending Registrations](#91-get-adminregistrations)
   - 9.2 [Approve Registration](#92-post-adminregistrationsidapprove)
   - 9.3 [Reject Registration](#93-post-adminregistrationsidreject)
   - 9.4 [Bulk Approve Registrations](#94-post-adminregistrationsbulk-approve)
10. [Enrollment Queue — Admin](#10-enrollment-queue--admin)
    - 10.1 [List Pending Enrollments](#101-get-adminenrollments)
    - 10.2 [Approve Enrollment](#102-post-adminenrollmentsidapprove)
    - 10.3 [Reject Enrollment](#103-post-adminenrollmentsidreject)
11. [Progress Endpoints](#11-progress-endpoints)
    - 11.1 [Mark Subject Complete](#111-post-progresssubjectsidcomplete)
    - 11.2 [Update Last Accessed](#112-post-progresssubjectsidaccess)
    - 11.3 [Get Course Progress](#113-get-meprogress-coursescourseid)
    - 11.4 [Get Subject Progress](#114-get-meprogress-subjectssubjectid)
    - 11.5 [Get Admin Course Progress](#115-get-adminprogress-coursescourseid)
12. [Notification Endpoints](#12-notification-endpoints)
    - 12.1 [List My Notifications](#121-get-menotifications)
    - 12.2 [Mark Notification Read](#122-post-menotificationsidread)
    - 12.3 [Mark All Read](#123-post-menotificationsread-all)
13. [User Management — Admin](#13-user-management--admin)
    - 13.1 [List Users](#131-get-users)
    - 13.2 [Get User by ID](#132-get-usersuid)
    - 13.3 [Suspend User](#133-post-usersusidsuspend)
    - 13.4 [Reactivate User](#134-post-usersuidreactivate)
14. [Admin Management — Super Admin](#14-admin-management--super-admin)
    - 14.1 [List Admins](#141-get-super-adminadmins)
    - 14.2 [Create Admin](#142-post-super-adminadmins)
    - 14.3 [Get Admin by ID](#143-get-super-adminadminsuid)
    - 14.4 [Suspend Admin](#144-post-super-adminadminsusidsuspend)
    - 14.5 [Reactivate Admin](#145-post-super-adminadminsuidreactivate)
    - 14.6 [Delete Admin](#146-delete-super-adminadminsuid)
    - 14.7 [Promote Student to Admin](#147-post-super-adminusersuidmake-admin)
15. [Audit Log — Super Admin](#15-audit-log--super-admin)
    - 15.1 [Get Audit Log](#151-get-audit-log)
16. [Health Endpoints](#16-health-endpoints)
    - 16.1 [Liveness Probe](#161-get-healthz)
    - 16.2 [Readiness Probe](#162-get-readyz)
17. [Data Models](#17-data-models)
18. [Error Codes Reference](#18-error-codes-reference)
19. [HTTP Status Code Reference](#19-http-status-code-reference)
20. [Domain Events Reference](#20-domain-events-reference)

---

## 1. Getting Started

### 1.1 Base URL & Versioning

All API requests are made to the versioned base URL:

```
Production:  https://api.yourdomain.com/api/v1
Staging:     https://api-staging.yourdomain.com/api/v1
Local Dev:   http://localhost:3000/api/v1
```

All paths in this document are relative to the base URL. For example, `GET /courses` means `GET https://api.yourdomain.com/api/v1/courses`.

---

### 1.2 Authentication

The CMP API uses **Firebase Authentication** with stateless Bearer tokens. The client obtains a Firebase ID token via the Firebase client SDK, then includes it on every authenticated request.

#### How to Authenticate

```
Authorization: Bearer <firebase-id-token>
```

**Token lifecycle:**
- Firebase ID tokens expire after **1 hour**
- The Firebase client SDK automatically refreshes tokens; always use `user.getIdToken()` to get a fresh token before each request
- Revoked tokens are rejected immediately (server calls `verifyIdToken(token, checkRevoked=true)`)

**Login** is handled entirely by the Firebase client SDK:

```javascript
// Firebase client SDK (web)
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';

const auth   = getAuth();
const result = await signInWithEmailAndPassword(auth, email, password);
const token  = await result.user.getIdToken();

// Use token in API requests
fetch('https://api.yourdomain.com/api/v1/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Endpoints that do NOT require authentication:**

| Endpoint | Description |
|----------|-------------|
| `POST /auth/register` | Student registration |
| `POST /auth/password-reset` | Trigger password reset email |
| `GET /courses` | Browse published course catalog |
| `GET /courses/:id` | View a published course detail |
| `GET /healthz` | Liveness probe |
| `GET /readyz` | Readiness probe |

---

### 1.3 Request Format

- All request bodies must be JSON with `Content-Type: application/json`
- File upload endpoints use `multipart/form-data` (noted per endpoint)
- All request IDs are echoed in responses via `X-Request-Id` header
- Clients may supply their own `X-Request-Id` (UUID v4); if absent the server generates one

#### Required Headers

| Header | Value | Required |
|--------|-------|:--------:|
| `Authorization` | `Bearer <id-token>` | On authenticated endpoints |
| `Content-Type` | `application/json` | On POST / PATCH with body |
| `X-Request-Id` | UUID v4 (optional, server generates if absent) | No |

---

### 1.4 Response Format

All successful responses return JSON. The shape depends on the operation:

#### Single resource
```json
{
  "id": "abc123",
  "title": "Introduction to TypeScript",
  "state": "published",
  "createdAt": "2026-05-01T08:00:00.000Z"
}
```

#### Paginated list
```json
{
  "items": [ ... ],
  "nextCursor": "abc123",
  "total": 47
}
```

> `total` is included where the server can compute it efficiently. `nextCursor` is `null` when there are no more pages.

#### Empty success (DELETE)
```
HTTP 204 No Content
(empty body)
```

---

### 1.5 Error Format

All errors return a consistent envelope:

```json
{
  "error": {
    "code":    "COURSE_NOT_FOUND",
    "message": "The requested course could not be found.",
    "details": {
      "courseId": ["Course with this ID does not exist"]
    }
  },
  "requestId": "7f3a1c2d-4e5b-6f7a-8b9c-0d1e2f3a4b5c"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `error.code` | `string` | Machine-readable error code (see Section 18) |
| `error.message` | `string` | Human-readable description |
| `error.details` | `object` | Field-level validation errors (only on 400 responses) |
| `requestId` | `string` | Correlation ID — include this in support requests |

---

### 1.6 Pagination

All list endpoints that may return large datasets use **cursor-based pagination**.

#### Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `limit` | `number` | `20` | Items per page (max `100`) |
| `cursor` | `string` | — | Cursor from `nextCursor` of previous response |

#### Example

```
GET /courses?limit=10
GET /courses?limit=10&cursor=abc123
```

#### Response

```json
{
  "items": [ ... ],
  "nextCursor": "xyz789",
  "total": 47
}
```

When `nextCursor` is `null`, you have reached the last page. Do not include `cursor` on the first request.

---

### 1.7 Rate Limiting

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| `POST /auth/*` | 10 requests | Per IP per minute |
| All other endpoints | 200 requests | Per IP per minute |

When a limit is exceeded, the server returns `429 Too Many Requests`. The response includes standard `RateLimit-*` headers:

```
RateLimit-Limit:     200
RateLimit-Remaining: 0
RateLimit-Reset:     1746684000
Retry-After:         34
```

---

### 1.8 Role Summary

| Role | Who | Access level |
|------|-----|-------------|
| **Public** | Unauthenticated visitors | Course catalog (published only), registration, password reset |
| **student** | Registered + approved students | Own profile, course catalog, own enrollments, learning content, own progress, own notifications |
| **admin** | Staff created directly by Super Admin | All course management, registration/enrollment queue, student management, notifications |
| **admin** *(promoted from student)* | Students promoted via `POST /super-admin/users/:uid/make-admin` | **Dual-role** — all admin capabilities **plus** all student capabilities (enroll in courses, track own progress, etc.) |
| **super_admin** | Platform owner | Everything admins can do + admin account management, audit log |

> **Note:** `super_admin` inherits all `admin` permissions. Any endpoint marked `admin` is also accessible to `super_admin`.
>
> **Dual-role admins:** When a student is promoted to admin, their account carries both `student` and `admin` roles. They pass role guards for either role simultaneously — they can manage courses as an admin and enroll in courses as a student within the same session. Admins created directly via `POST /super-admin/admins` carry only the `admin` role.

---

## 2. Auth Endpoints

---

### 2.1 `POST /auth/register`

Register a new student account. The account is created in a `PENDING_APPROVAL` state and cannot log in until an Admin approves it.

**Authentication:** None (public)

#### Request Body

```json
{
  "firstName": "Viruli",
  "lastName":  "Weerasinghe",
  "email":     "viruli@example.com",
  "password":  "SecurePass@2026"
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `firstName` | `string` | Yes | 1–100 characters |
| `lastName` | `string` | Yes | 1–100 characters |
| `email` | `string` | Yes | Valid email format; must be unique |
| `password` | `string` | Yes | Min 10 chars · uppercase · lowercase · number · special character |

#### Responses

**`201 Created`** — Registration submitted successfully
```json
{
  "message": "Registration submitted. Your account is pending approval."
}
```

**`400 Bad Request`** — Validation error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "password": ["Must include at least one uppercase letter"],
      "email":    ["Enter a valid email address"]
    }
  },
  "requestId": "..."
}
```

**`409 Conflict`** — Email already registered
```json
{
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "This email address is already registered."
  },
  "requestId": "..."
}
```

---

### 2.2 `POST /auth/logout`

Revoke all refresh tokens for the authenticated user. Existing ID tokens remain valid until their 1-hour expiry, but no new tokens can be issued from the revoked refresh token.

**Authentication:** Bearer token required

#### Request Body

None.

#### Responses

**`200 OK`**
```json
{
  "message": "Logged out successfully."
}
```

**`401 Unauthorized`** — Invalid or missing token
```json
{
  "error": { "code": "MISSING_TOKEN", "message": "Authorization header required." },
  "requestId": "..."
}
```

---

### 2.3 `POST /auth/password-reset`

Send a password reset email to the given address. Always returns `200` regardless of whether the email exists (prevents enumeration).

**Authentication:** None (public)

#### Request Body

```json
{
  "email": "viruli@example.com"
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `email` | `string` | Yes | Valid email format |

#### Responses

**`200 OK`**
```json
{
  "message": "If an account exists for this email, a reset link has been sent."
}
```

---

## 3. Profile Endpoints (Me)

---

### 3.1 `GET /me`

Get the authenticated user's full profile.

**Authentication:** Bearer token required
**Roles:** `student`, `admin`, `super_admin`

#### Responses

**`200 OK`**
```json
{
  "uid":             "firebase-uid-abc123",
  "email":           "viruli@example.com",
  "role":            "student",
  "roles":           ["student"],
  "status":          "approved",
  "firstName":       "Viruli",
  "lastName":        "Weerasinghe",
  "profilePhotoUrl": "https://storage.googleapis.com/bucket/photos/abc.jpg",
  "createdAt":       "2026-05-01T08:00:00.000Z",
  "updatedAt":       "2026-05-05T10:30:00.000Z"
}
```

See [User object](#user) in Data Models.

---

### 3.2 `PATCH /me`

Update the authenticated user's own profile. Only the fields listed below may be changed; `email`, `role`, and `status` are immutable through this endpoint.

**Authentication:** Bearer token required
**Roles:** `student`, `admin`, `super_admin`

#### Request Body

```json
{
  "firstName":       "Viruli",
  "lastName":        "Weerasinghe",
  "profilePhotoUrl": "https://storage.googleapis.com/bucket/photos/new.jpg"
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `firstName` | `string` | No | 1–100 characters |
| `lastName` | `string` | No | 1–100 characters |
| `profilePhotoUrl` | `string` | No | Valid HTTPS URL |

> Send only the fields you want to change (partial update).

#### Responses

**`200 OK`** — Updated user object (same shape as `GET /me`)

**`400 Bad Request`** — Validation error

---

### 3.3 `POST /me/change-password`

Initiate a server-side password change for the authenticated user.

**Authentication:** Bearer token required
**Roles:** `student`, `admin`, `super_admin`

#### Request Body

```json
{
  "newPassword": "NewSecurePass@2026"
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `newPassword` | `string` | Yes | Min 10 chars · uppercase · lowercase · number · special character |

#### Responses

**`200 OK`**
```json
{
  "message": "Password updated successfully."
}
```

---

## 4. Course Endpoints

---

### 4.1 `GET /courses`

List courses. Returns only `published` courses for unauthenticated requests and student role. Returns all states (`draft`, `published`, `archived`) for `admin` and `super_admin`.

**Authentication:** Optional
**Roles:** All (filtered by role)

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `limit` | `number` | `20` | Items per page (max 100) |
| `cursor` | `string` | — | Pagination cursor |
| `state` | `string` | — | Filter by state: `draft`, `published`, `archived` (admin only) |
| `q` | `string` | — | Search by title (partial match, case-insensitive) |

#### Responses

**`200 OK`**
```json
{
  "items": [
    {
      "id":             "course-abc",
      "title":          "Introduction to TypeScript",
      "description":    "Learn TypeScript from scratch.",
      "coverImageUrl":  "https://storage.googleapis.com/bucket/covers/ts.jpg",
      "state":          "published",
      "semesterCount":  3,
      "createdBy":      "admin-uid-xyz",
      "createdByName":  "Sapna Nethmini",
      "publishedAt":    "2026-05-03T09:00:00.000Z",
      "createdAt":      "2026-05-01T08:00:00.000Z",
      "updatedAt":      "2026-05-03T09:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 1
}
```

---

### 4.2 `GET /courses/:id`

Get a single course by ID.

- **Students & public:** Returns `404` if the course is in `draft` or `archived` state
- **Admins:** Returns the course in any state
- The response includes the full semester and subject tree

**Authentication:** Optional
**Roles:** All (visibility filtered by role)

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Course document ID |

#### Responses

**`200 OK`**
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
              "id":          "att-001",
              "fileName":    "lesson-01-notes.pdf",
              "mimeType":    "application/pdf",
              "sizeBytes":   204800,
              "uploadedAt":  "2026-05-02T10:00:00.000Z"
            }
          ]
        }
      ]
    }
  ]
}
```

**`404 Not Found`**
```json
{
  "error": { "code": "COURSE_NOT_FOUND", "message": "The requested course could not be found." },
  "requestId": "..."
}
```

---

### 4.3 `POST /courses`

Create a new course in `draft` state.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Request Body

```json
{
  "title":       "Introduction to TypeScript",
  "description": "A comprehensive guide to learning TypeScript from the ground up.",
  "coverImageUrl": "https://storage.googleapis.com/bucket/covers/ts.jpg"
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `title` | `string` | Yes | 1–200 characters; must be unique across all courses |
| `description` | `string` | Yes | 1–5000 characters |
| `coverImageUrl` | `string` | No | Valid HTTPS URL |

#### Responses

**`201 Created`** — Full course object (same shape as `GET /courses/:id`, `semesters: []`)

**`409 Conflict`**
```json
{
  "error": { "code": "COURSE_TITLE_EXISTS", "message": "A course with this title already exists." },
  "requestId": "..."
}
```

---

### 4.4 `PATCH /courses/:id`

Update course metadata. Course must be in `draft` state; published/archived courses must be unpublished first.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Course document ID |

#### Request Body

```json
{
  "title":          "Introduction to TypeScript — Updated",
  "description":    "Updated description.",
  "coverImageUrl":  "https://storage.googleapis.com/bucket/covers/ts-new.jpg"
}
```

All fields are optional. Send only the fields to change.

#### Responses

**`200 OK`** — Updated course object

**`404 Not Found`** — Course does not exist

---

### 4.5 `POST /courses/:id/publish`

Publish a `draft` course, making it visible in the public catalog.

**Pre-conditions (server-enforced):**
- Course must have at least **1 semester**
- Every semester must have at least **1 subject**

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Course document ID |

#### Request Body

None.

#### Responses

**`200 OK`** — Updated course object with `state: "published"`

**`409 Conflict`** — Course is not in `draft` state
```json
{
  "error": { "code": "INVALID_STATE", "message": "Only DRAFT courses can be published." },
  "requestId": "..."
}
```

**`422 Unprocessable Entity`** — Business rule violation
```json
{
  "error": {
    "code":    "EMPTY_SEMESTER",
    "message": "Every semester must have at least one subject before publishing."
  },
  "requestId": "..."
}
```

---

### 4.6 `POST /courses/:id/unpublish`

Return a `published` course to `draft` state, hiding it from the public catalog.

> Enrolled students retain their approved enrollments. Access to learning content is suspended until the course is re-published.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Responses

**`200 OK`** — Updated course object with `state: "draft"`

---

### 4.7 `POST /courses/:id/archive`

Archive a `published` course. Archived courses are hidden from the public catalog but enrolled students retain read-only access to content.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Responses

**`200 OK`** — Updated course object with `state: "archived"`

---

### 4.8 `DELETE /courses/:id`

Soft-delete a course. Sets `deletedAt` timestamp; the document is recoverable for **30 days**.

> Courses with existing approved enrollments and progress data are soft-deleted, not hard-deleted.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Responses

**`204 No Content`** — Deleted successfully (empty body)

**`404 Not Found`** — Course does not exist

---

## 5. Semester Endpoints

---

### 5.1 `POST /courses/:id/semesters`

Add a new semester to a course.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Course document ID |

#### Request Body

```json
{
  "name":      "Semester 1 — Foundations",
  "sortOrder": 1
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `name` | `string` | Yes | 1–200 characters |
| `sortOrder` | `number` | Yes | Positive integer; controls display order |

#### Responses

**`201 Created`**
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

---

### 5.2 `PATCH /semesters/:id`

Update a semester's name or sort order.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Semester document ID |

#### Request Body

```json
{
  "name":      "Semester 1 — Core Foundations",
  "sortOrder": 2
}
```

All fields optional.

#### Responses

**`200 OK`** — Updated semester object

---

### 5.3 `DELETE /semesters/:id`

Soft-delete a semester and all its subjects.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Responses

**`204 No Content`**

---

## 6. Subject Endpoints

---

### 6.1 `POST /semesters/:id/subjects`

Add a subject (lesson) to a semester.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Semester document ID |

#### Request Body

```json
{
  "title":          "TypeScript Basics",
  "description":    "Variables, types, interfaces, and enums.",
  "youtubeVideoUrl":"https://www.youtube.com/watch?v=zQnBQ4tB3ZA",
  "sortOrder":      1
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `title` | `string` | Yes | 1–200 characters |
| `description` | `string` | Yes | 1–5000 characters |
| `youtubeVideoUrl` | `string` | Yes | Valid YouTube URL or 11-character video ID |
| `sortOrder` | `number` | Yes | Positive integer |

> The server extracts and stores only the 11-character YouTube video ID regardless of URL format submitted.

#### Responses

**`201 Created`**
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

**`400 Bad Request`**
```json
{
  "error": {
    "code":    "INVALID_YOUTUBE_ID",
    "message": "The provided YouTube URL or video ID is not valid."
  },
  "requestId": "..."
}
```

---

### 6.2 `PATCH /subjects/:id`

Update subject content.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Subject document ID |

#### Request Body

```json
{
  "title":          "TypeScript Basics — Revised",
  "description":    "Updated description.",
  "youtubeVideoUrl":"https://www.youtube.com/watch?v=newVideoId",
  "sortOrder":      2
}
```

All fields optional.

#### Responses

**`200 OK`** — Updated subject object

---

### 6.3 `DELETE /subjects/:id`

Soft-delete a subject.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Responses

**`204 No Content`**

---

## 7. Attachment Endpoints

---

### 7.1 `POST /subjects/:id/attachments`

Upload a file attachment to a subject. Accepted file types: **PDF**, **DOC**, **DOCX**. Maximum file size: **25 MB**.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`
**Content-Type:** `multipart/form-data`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Subject document ID |

#### Request (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `file` | `File` | Yes | PDF, DOC, or DOCX file; max 25 MB |

#### Example cURL

```bash
curl -X POST https://api.yourdomain.com/api/v1/subjects/sub-001/attachments \
  -H "Authorization: Bearer <token>" \
  -F "file=@lesson-notes.pdf"
```

#### Responses

**`201 Created`**
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

**`415 Unsupported Media Type`**
```json
{
  "error": {
    "code":    "UNSUPPORTED_MEDIA_TYPE",
    "message": "File type 'image/png' is not allowed. Accepted: PDF, DOC, DOCX."
  },
  "requestId": "..."
}
```

**`400 Bad Request`** — File exceeds 25 MB
```json
{
  "error": {
    "code":    "FILE_TOO_LARGE",
    "message": "File size exceeds the 25 MB limit."
  },
  "requestId": "..."
}
```

---

### 7.2 `GET /attachments/:id/download-url`

Get a short-lived signed download URL for a specific attachment. The URL expires in **15 minutes**.

> Only students with an **approved** enrollment in the parent course may download attachments.

**Authentication:** Bearer token required
**Roles:** `student` (approved enrollment required), `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Attachment document ID |

#### Responses

**`200 OK`**
```json
{
  "downloadUrl": "https://storage.googleapis.com/bucket/attachments/att-001.pdf?X-Goog-Signature=...",
  "expiresAt":   "2026-05-07T10:15:00.000Z"
}
```

**`403 Forbidden`** — Student is not enrolled or enrollment is not approved
```json
{
  "error": { "code": "ENROLLMENT_REQUIRED", "message": "An approved enrollment is required to download attachments." },
  "requestId": "..."
}
```

---

### 7.3 `DELETE /attachments/:id`

Remove an attachment from Cloud Storage and from the subject's attachment list.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Responses

**`204 No Content`**

---

## 8. Enrollment Endpoints — Student

---

### 8.1 `POST /courses/:id/enroll`

Submit an enrollment request for a published course. The request enters a `pending` state until an Admin approves or rejects it.

**Constraints:**
- A student may only have **1 pending or approved** enrollment per course at a time
- The course must be in `published` state
- Student account must be in `approved` status

**Authentication:** Bearer token required
**Roles:** `student`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Course document ID |

#### Request Body

None.

#### Responses

**`201 Created`**
```json
{
  "id":          "enr-student-uid_course-abc",
  "courseId":    "course-abc",
  "courseTitle": "Introduction to TypeScript",
  "studentUid":  "firebase-uid-abc123",
  "state":       "pending",
  "createdAt":   "2026-05-05T08:00:00.000Z",
  "updatedAt":   "2026-05-05T08:00:00.000Z"
}
```

**`409 Conflict`** — Duplicate enrollment
```json
{
  "error": {
    "code":    "ENROLLMENT_EXISTS",
    "message": "You already have a pending or approved enrollment for this course."
  },
  "requestId": "..."
}
```

**`422 Unprocessable Entity`** — Course is not published
```json
{
  "error": {
    "code":    "COURSE_NOT_PUBLISHED",
    "message": "Enrollment is only available for published courses."
  },
  "requestId": "..."
}
```

**`429 Too Many Requests`** — Resubmitting before the cool-off period (24h after rejection)
```json
{
  "error": {
    "code":    "RESUBMIT_TOO_EARLY",
    "message": "You must wait 24 hours after a rejection before resubmitting."
  },
  "requestId": "..."
}
```

---

### 8.2 `GET /me/enrollments`

List the authenticated student's enrollments.

**Authentication:** Bearer token required
**Roles:** `student`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `state` | `string` | — | Filter by enrollment state: `pending`, `approved`, `rejected`, `withdrawn` |
| `limit` | `number` | `20` | Items per page |
| `cursor` | `string` | — | Pagination cursor |

#### Responses

**`200 OK`**
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
  "total": 1
}
```

---

### 8.3 `POST /enrollments/:id/withdraw`

Withdraw a `pending` enrollment request.

> Only `pending` enrollments may be withdrawn. Approved enrollments cannot be withdrawn through this endpoint.

**Authentication:** Bearer token required
**Roles:** `student`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Enrollment document ID |

#### Request Body

None.

#### Responses

**`200 OK`** — Updated enrollment with `state: "withdrawn"`

**`409 Conflict`** — Enrollment is not in `pending` state

---

## 9. Registration Queue — Admin

---

### 9.1 `GET /admin/registrations`

List student registration requests.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `status` | `string` | `pending` | Filter by status: `pending`, `approved`, `rejected` |
| `limit` | `number` | `25` | Items per page (max 100) |
| `cursor` | `string` | — | Pagination cursor |
| `q` | `string` | — | Search by student name or email |

#### Responses

**`200 OK`**
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

Approve a pending student registration. The student's account status is set to `approved` and they can now log in.

**Side effects:** An email and in-app notification are sent to the student.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Registration document ID |

#### Request Body

None.

#### Responses

**`200 OK`**
```json
{
  "message":    "Registration approved.",
  "studentUid": "firebase-uid-abc123"
}
```

**`409 Conflict`** — Registration is no longer in `pending` state
```json
{
  "error": { "code": "INVALID_STATE", "message": "Registration is no longer pending." },
  "requestId": "..."
}
```

---

### 9.3 `POST /admin/registrations/:id/reject`

Reject a pending student registration. An optional reason may be provided.

**Side effects:** An email and in-app notification are sent to the student.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Registration document ID |

#### Request Body

```json
{
  "reason": "Incomplete registration information."
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `reason` | `string` | No | Reason shown to the student (max 500 chars) |

#### Responses

**`200 OK`**
```json
{
  "message":    "Registration rejected.",
  "studentUid": "firebase-uid-abc123"
}
```

---

### 9.4 `POST /admin/registrations/bulk-approve`

Approve multiple pending registrations in one request. Uses `Promise.allSettled` — partial success is possible.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Request Body

```json
{
  "registrationIds": ["reg-001", "reg-002", "reg-003"]
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `registrationIds` | `string[]` | Yes | 1–50 registration IDs per request |

#### Responses

**`200 OK`**
```json
{
  "approved": ["reg-001", "reg-003"],
  "failed": [
    {
      "id":     "reg-002",
      "reason": "Registration is no longer pending."
    }
  ]
}
```

---

## 10. Enrollment Queue — Admin

---

### 10.1 `GET /admin/enrollments`

List course enrollment requests awaiting review.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `status` | `string` | `pending` | Filter by status: `pending`, `approved`, `rejected` |
| `courseId` | `string` | — | Filter by specific course |
| `limit` | `number` | `25` | Items per page |
| `cursor` | `string` | — | Pagination cursor |

#### Responses

**`200 OK`**
```json
{
  "items": [
    {
      "id":          "enr-abc",
      "studentUid":  "firebase-uid-abc123",
      "studentName": "Viruli Weerasinghe",
      "studentEmail":"viruli@example.com",
      "courseId":    "course-abc",
      "courseTitle": "Introduction to TypeScript",
      "state":       "pending",
      "submittedAt": "2026-05-05T08:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 5
}
```

---

### 10.2 `POST /admin/enrollments/:id/approve`

Approve a pending enrollment request. The student gains access to course content.

**Side effects:** An in-app notification, email, and push notification (if opted-in) are sent to the student.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Enrollment document ID |

#### Request Body

None.

#### Responses

**`200 OK`**
```json
{
  "id":       "enr-abc",
  "courseId": "course-abc",
  "state":    "approved",
  "approvedAt": "2026-05-06T09:00:00.000Z"
}
```

---

### 10.3 `POST /admin/enrollments/:id/reject`

Reject a pending enrollment request.

**Side effects:** An in-app notification and email are sent to the student with the optional reason.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Enrollment document ID |

#### Request Body

```json
{
  "reason": "This course is currently at full capacity."
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `reason` | `string` | No | Reason shown to the student (max 500 chars) |

#### Responses

**`200 OK`**
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

---

### 11.1 `POST /progress/subjects/:id/complete`

Mark a subject as completed. This operation is **idempotent** — if the subject is already marked complete, the existing record is returned unchanged and `completedAt` is NOT updated.

> This endpoint is called either manually by the student tapping "Mark Complete", or automatically when YouTube playback reaches 90% threshold.

**Authentication:** Bearer token required
**Roles:** `student`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Subject document ID |

#### Request Body

```json
{
  "source": "manual"
}
```

| Field | Type | Required | Default | Description |
|-------|------|:--------:|:-------:|-------------|
| `source` | `string` | No | `"manual"` | How completion was triggered: `"manual"` or `"auto"` |

#### Responses

**`200 OK`**
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

Update the last-accessed timestamp for a subject (used to power the "Continue Learning" resume feature).

**Authentication:** Bearer token required
**Roles:** `student`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Subject document ID |

#### Request Body

None.

#### Responses

**`200 OK`**
```json
{
  "subjectId":      "sub-001",
  "lastAccessedAt": "2026-05-07T14:30:00.000Z"
}
```

---

### 11.3 `GET /me/progress/courses/:courseId`

Get the authenticated student's progress aggregate for a course.

**Authentication:** Bearer token required
**Roles:** `student`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `courseId` | Course document ID |

#### Responses

**`200 OK`**
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
| `lastAccessedSubjectId` | Subject the student should resume from; `null` if no subjects accessed |

---

### 11.4 `GET /me/progress/subjects/:subjectId`

Get progress for a specific subject.

**Authentication:** Bearer token required
**Roles:** `student`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `subjectId` | Subject document ID |

#### Responses

**`200 OK`**
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

**`404 Not Found`** — No progress record exists (student has not accessed this subject)

---

### 11.5 `GET /admin/progress/courses/:courseId`

Get aggregated progress statistics for all students enrolled in a course.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `courseId` | Course document ID |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `limit` | `number` | `25` | Students per page |
| `cursor` | `string` | — | Pagination cursor |

#### Responses

**`200 OK`**
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

---

### 12.1 `GET /me/notifications`

List the authenticated user's in-app notifications, newest first.

**Authentication:** Bearer token required
**Roles:** `student`, `admin`, `super_admin`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `unreadOnly` | `boolean` | `false` | If `true`, return only unread notifications |
| `limit` | `number` | `20` | Items per page |
| `cursor` | `string` | — | Pagination cursor |

#### Responses

**`200 OK`**
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

**Authentication:** Bearer token required
**Roles:** `student`, `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Notification document ID |

#### Request Body

None.

#### Responses

**`200 OK`**
```json
{
  "id":     "notif-001",
  "readAt": "2026-05-07T10:00:00.000Z"
}
```

---

### 12.3 `POST /me/notifications/read-all`

Mark all of the authenticated user's notifications as read.

**Authentication:** Bearer token required
**Roles:** `student`, `admin`, `super_admin`

#### Request Body

None.

#### Responses

**`200 OK`**
```json
{
  "markedCount": 3
}
```

---

## 13. User Management — Admin

---

### 13.1 `GET /users`

List all users (students) in the system.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `status` | `string` | — | Filter by: `pending_approval`, `approved`, `rejected`, `suspended` |
| `role` | `string` | `student` | Filter by role |
| `courseId` | `string` | — | Filter students enrolled in a specific course |
| `q` | `string` | — | Search by name or email (partial match) |
| `limit` | `number` | `25` | Items per page (max 100) |
| `cursor` | `string` | — | Pagination cursor |

#### Responses

**`200 OK`**
```json
{
  "items": [
    {
      "uid":             "firebase-uid-abc123",
      "email":           "viruli@example.com",
      "role":            "student",
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

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID |

#### Responses

**`200 OK`**
```json
{
  "uid":             "firebase-uid-abc123",
  "email":           "viruli@example.com",
  "role":            "student",
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

Suspend a student's account. The student's Firebase Auth account is disabled and all refresh tokens are revoked.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID of the student to suspend |

#### Request Body

```json
{
  "reason": "Violation of platform terms of service."
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `reason` | `string` | No | Internal reason for suspension (not shown to student) |

#### Responses

**`200 OK`**
```json
{
  "uid":    "firebase-uid-abc123",
  "status": "suspended"
}
```

**`409 Conflict`** — User is already suspended

---

### 13.4 `POST /users/:uid/reactivate`

Reactivate a suspended student's account.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID |

#### Responses

**`200 OK`**
```json
{
  "uid":    "firebase-uid-abc123",
  "status": "approved"
}
```

---

## 14. Admin Management — Super Admin

---

### 14.1 `GET /super-admin/admins`

List all admin accounts.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `status` | `string` | — | Filter by: `approved`, `suspended` |
| `q` | `string` | — | Search by name or email |
| `limit` | `number` | `25` | Items per page |
| `cursor` | `string` | — | Pagination cursor |

#### Responses

**`200 OK`**
```json
{
  "items": [
    {
      "uid":       "admin-uid-xyz",
      "email":     "sapna@example.com",
      "role":      "admin",
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

Create a new Admin account. The account is immediately active (`approved` status). An email with login credentials is sent to the new admin.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Request Body

```json
{
  "firstName":       "Sapna",
  "lastName":        "Nethmini",
  "email":           "sapna@example.com",
  "initialPassword": "TempPass@2026"
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `firstName` | `string` | Yes | 1–100 characters |
| `lastName` | `string` | Yes | 1–100 characters |
| `email` | `string` | Yes | Valid email; must be unique |
| `initialPassword` | `string` | Yes | Min 10 chars · complexity rules |

#### Responses

**`201 Created`**
```json
{
  "uid":       "admin-uid-xyz",
  "email":     "sapna@example.com",
  "role":      "admin",
  "status":    "approved",
  "firstName": "Sapna",
  "lastName":  "Nethmini",
  "createdAt": "2026-05-07T08:00:00.000Z"
}
```

**`409 Conflict`** — Email already registered

---

### 14.3 `GET /super-admin/admins/:uid`

Get a specific admin's full profile.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID of the admin |

#### Responses

**`200 OK`** — Full user object (see User data model)

---

### 14.4 `POST /super-admin/admins/:uid/suspend`

Suspend an Admin account. The admin's Firebase Auth account is disabled and all refresh tokens are revoked. An `admin.suspended` event is published — the suspended admin receives an email notification.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID of the admin to suspend |

#### Request Body

```json
{
  "reason": "Under review."
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `reason` | `string` | No | Internal reason (max 500 chars); not shown to the admin |

#### Responses

**`200 OK`** — Full updated admin object
```json
{
  "uid":             "admin-uid-xyz",
  "email":           "sapna@example.com",
  "firstName":       "Sapna",
  "lastName":        "Nethmini",
  "role":            "admin",
  "status":          "suspended",
  "profilePhotoUrl": null,
  "createdAt":       "2026-05-11T04:49:06.197Z",
  "updatedAt":       "2026-05-11T05:15:02.254Z",
  "deletedAt":       null
}
```

**`404 Not Found`** — Admin UID does not exist
```json
{
  "error": { "code": "USER_NOT_FOUND", "message": "User not found." },
  "requestId": "..."
}
```

---

### 14.5 `POST /super-admin/admins/:uid/reactivate`

Reactivate a suspended Admin account. Re-enables the Firebase Auth account so the admin can log in again.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID of the admin to reactivate |

#### Request Body

None.

#### Responses

**`200 OK`** — Full updated admin object
```json
{
  "uid":             "admin-uid-xyz",
  "email":           "sapna@example.com",
  "firstName":       "Sapna",
  "lastName":        "Nethmini",
  "role":            "admin",
  "status":          "approved",
  "profilePhotoUrl": null,
  "createdAt":       "2026-05-11T04:49:06.197Z",
  "updatedAt":       "2026-05-11T05:15:06.084Z",
  "deletedAt":       null
}
```

**`404 Not Found`** — Admin UID does not exist

---

### 14.6 `DELETE /super-admin/admins/:uid`

Soft-delete an Admin account. Sets `deletedAt` on the Firestore document and disables the Firebase Auth account. The admin can no longer log in. Only accounts with `role: "admin"` may be deleted through this endpoint — attempting to delete a `super_admin` or `student` UID returns `404`.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID of the admin to delete |

#### Request Body

None.

#### Responses

**`204 No Content`** — Deleted successfully (empty body)

**`404 Not Found`** — UID does not exist or is not an admin account

---

### 14.7 `POST /super-admin/users/:uid/make-admin`

Promote an existing student account to admin role. The promoted user retains their student role alongside the new admin role (**dual-role**), meaning they can continue to enroll in courses and track progress as a student while also performing admin duties.

- Primary `role` is set to `"admin"`
- `roles` array becomes `["student", "admin"]`
- `status` is set to `"approved"`
- Firebase custom claim is updated immediately (next token refresh picks it up)

**Cannot be used on:** accounts that are already `admin` or `super_admin` — returns `409 INVALID_ROLE`.

**Side effects:** Publishes `admin.created` event (`promoted: true`) — promoted user receives an email notification.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID of the student to promote |

#### Request Body

None.

#### Responses

**`200 OK`** — Full updated user object
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

> The promoted user's existing enrollments, progress records, and notifications are preserved. They can continue using student features under the same account.

**`404 Not Found`** — UID does not exist
```json
{ "error": { "code": "USER_NOT_FOUND", "message": "User not found." }, "requestId": "..." }
```

**`409 Conflict`** — User is already admin or super_admin
```json
{ "error": { "code": "INVALID_ROLE", "message": "Only student accounts can be promoted to admin." }, "requestId": "..." }
```

---

## 15. Audit Log — Super Admin

---

### 15.1 `GET /audit-log`

Retrieve the append-only system audit log. Records are immutable once written.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `actorUid` | `string` | — | Filter by the UID of the actor who performed the action |
| `action` | `string` | — | Filter by action type (e.g., `registration.approved`) |
| `targetType` | `string` | — | Filter by target entity type (e.g., `course`, `enrollment`) |
| `targetId` | `string` | — | Filter by specific resource ID |
| `from` | `string` | — | ISO 8601 date — start of date range |
| `to` | `string` | — | ISO 8601 date — end of date range |
| `limit` | `number` | `20` | Items per page (max 100) |
| `cursor` | `string` | — | Pagination cursor |

#### Responses

**`200 OK`**
```json
{
  "items": [
    {
      "id":          "audit-001",
      "actorUid":    "admin-uid-xyz",
      "actorEmail":  "sapna@example.com",
      "action":      "registration.approved",
      "targetType":  "registration",
      "targetId":    "reg-001",
      "payload": {
        "studentUid": "firebase-uid-abc123"
      },
      "requestId":   "7f3a1c2d-4e5b-6f7a-8b9c-0d1e2f3a4b5c",
      "createdAt":   "2026-05-06T09:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 142
}
```

| Field | Description |
|-------|-------------|
| `actorUid` | UID of the user who performed the action; `null` for system-generated events |
| `action` | Event type string (see Section 20) |
| `targetType` | Entity type acted on: `user`, `course`, `enrollment`, `registration`, `admin`, `subject` |
| `requestId` | End-to-end correlation ID |

---

## 16. Health Endpoints

---

### 16.1 `GET /healthz`

Liveness probe — checks that the service process is running.

**Authentication:** None
**Path:** Available directly on each service (`http://[service-host]:[port]/healthz`)

#### Responses

**`200 OK`**
```json
{
  "status":  "ok",
  "service": "course-service",
  "ts":      1746684000000
}
```

---

### 16.2 `GET /readyz`

Readiness probe — checks that the service is ready to handle traffic (Firestore connectivity verified).

**Authentication:** None

#### Responses

**`200 OK`**
```json
{
  "status": "ready"
}
```

**`503 Service Unavailable`** — Firestore or a required dependency is unreachable
```json
{
  "status": "not_ready",
  "error":  "Firestore unreachable"
}
```

---

## 17. Data Models

### User

```typescript
interface User {
  uid:              string;        // Firebase Auth UID (primary key)
  email:            string;        // Unique email address
  role:             UserRole;      // Primary role: 'super_admin' | 'admin' | 'student'
  roles:            UserRole[];    // Full role set — promoted admins carry ['student', 'admin']
  status:           UserStatus;    // See UserStatus enum below
  firstName:        string;
  lastName:         string;
  profilePhotoUrl:  string | null; // HTTPS URL to Cloud Storage
  createdAt:        string;        // ISO 8601 timestamp
  updatedAt:        string;        // ISO 8601 timestamp
}

type UserRole   = 'super_admin' | 'admin' | 'student';
type UserStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended';
```

> `role` is the primary role used for display and filtering. `roles` is the authoritative set used by the server's authorization middleware — a token with `roles: ["student", "admin"]` passes guards for both roles simultaneously.

---

### Course

```typescript
interface Course {
  id:             string;
  title:          string;
  titleSlug:      string;          // URL-friendly version of title
  description:    string;
  coverImageUrl:  string | null;
  state:          CourseState;
  createdBy:      string;          // Admin UID
  createdByName:  string;          // Admin display name
  semesterCount:  number;
  publishedAt:    string | null;   // ISO 8601; null if never published
  createdAt:      string;
  updatedAt:      string;
  deletedAt:      string | null;   // Set on soft-delete
  semesters?:     Semester[];      // Included in GET /courses/:id only
}

type CourseState = 'draft' | 'published' | 'archived';
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
  subjects?:    Subject[];         // Included in GET /courses/:id only
  createdAt:    string;
  updatedAt:    string;
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
  youtubeVideoId: string;          // 11-character YouTube video ID
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
  fileName:    string;             // Original file name
  mimeType:    string;             // 'application/pdf' | 'application/msword' | ...
  sizeBytes:   number;
  storagePath: string;             // Internal Cloud Storage path (not exposed to clients)
  uploadedBy:  string;             // Admin UID
  uploadedAt:  string;             // ISO 8601
}
```

---

### Enrollment

```typescript
interface Enrollment {
  id:           string;            // Composite: `${studentUid}_${courseId}`
  studentUid:   string;
  courseId:     string;
  courseTitle:  string;
  state:        EnrollmentState;
  approvedAt?:  string;            // ISO 8601; present when state=approved
  rejectedAt?:  string;            // ISO 8601; present when state=rejected
  reason?:      string;            // Rejection reason (optional)
  createdAt:    string;
  updatedAt:    string;
}

type EnrollmentState = 'pending' | 'approved' | 'rejected' | 'withdrawn';
```

---

### SubjectProgress

```typescript
interface SubjectProgress {
  studentUid:        string;
  subjectId:         string;
  courseId:          string;
  semesterId:        string;
  state:             ProgressState;
  completionSource?: 'manual' | 'auto';    // How completion was triggered
  completedAt?:      string;               // ISO 8601; immutable once set
  lastAccessedAt?:   string;               // ISO 8601; updated on each visit
}

type ProgressState = 'not_started' | 'in_progress' | 'completed';
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
  completionPercent:      number;  // 0.0 – 100.0, 1 decimal place
  lastAccessedSubjectId:  string | null;
}
```

---

### Notification

```typescript
interface Notification {
  id:        string;
  userUid:   string;
  category:  NotificationCategory;
  title:     string;
  body:      string;
  payload:   Record<string, unknown>;   // Event-specific data (e.g., courseId)
  readAt:    string | null;             // null = unread
  createdAt: string;
}

type NotificationCategory =
  | 'registration_approved'
  | 'registration_rejected'
  | 'enrollment_pending'
  | 'enrollment_approved'
  | 'enrollment_rejected'
  | 'course_published'
  | 'system';
```

---

### AuditLogEntry

```typescript
interface AuditLogEntry {
  id:         string;
  actorUid:   string | null;        // null for system events
  actorEmail: string | null;
  action:     string;               // e.g., 'registration.approved'
  targetType: string;               // 'user' | 'course' | 'enrollment' | ...
  targetId:   string;
  payload:    Record<string, unknown>;
  requestId:  string;
  createdAt:  string;               // ISO 8601 — immutable
}
```

---

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  items:       T[];
  nextCursor:  string | null;
  total?:      number;
}
```

---

## 18. Error Codes Reference

| Code | HTTP Status | Description |
|------|:-----------:|-------------|
| `VALIDATION_ERROR` | 400 | One or more request fields failed validation; see `details` |
| `INVALID_YOUTUBE_ID` | 400 | YouTube URL or video ID is invalid |
| `FILE_TOO_LARGE` | 400 | Uploaded file exceeds 25 MB |
| `MISSING_TOKEN` | 401 | `Authorization: Bearer` header is absent |
| `TOKEN_EXPIRED` | 401 | Firebase ID token has expired (client should refresh) |
| `TOKEN_REVOKED` | 401 | Firebase ID token has been revoked (force re-login) |
| `INVALID_TOKEN` | 401 | Token signature is invalid or cannot be verified |
| `UNAUTHENTICATED` | 401 | Request requires authentication |
| `FORBIDDEN` | 403 | Valid token but insufficient role |
| `ENROLLMENT_REQUIRED` | 403 | Student must have an approved enrollment to access content |
| `COURSE_NOT_FOUND` | 404 | Course does not exist or is not visible to the caller's role |
| `SEMESTER_NOT_FOUND` | 404 | Semester does not exist |
| `SUBJECT_NOT_FOUND` | 404 | Subject does not exist |
| `ATTACHMENT_NOT_FOUND` | 404 | Attachment does not exist |
| `ENROLLMENT_NOT_FOUND` | 404 | Enrollment does not exist |
| `USER_NOT_FOUND` | 404 | User UID does not exist |
| `EMAIL_EXISTS` | 409 | Email address is already registered |
| `COURSE_TITLE_EXISTS` | 409 | A course with this title already exists |
| `ENROLLMENT_EXISTS` | 409 | Student already has a pending or approved enrollment for this course |
| `INVALID_STATE` | 409 | Operation not permitted in the resource's current state |
| `ALREADY_SUSPENDED` | 409 | Account is already suspended |
| `ALREADY_ACTIVE` | 409 | Account is already active |
| `NO_SEMESTERS` | 422 | Cannot publish a course with no semesters |
| `EMPTY_SEMESTER` | 422 | Every semester must have at least one subject before publishing |
| `COURSE_NOT_PUBLISHED` | 422 | Enrollment only allowed on published courses |
| `RESUBMIT_TOO_EARLY` | 429 | Student must wait the cool-off period before resubmitting after rejection |
| `RATE_LIMIT_EXCEEDED` | 429 | General rate limit exceeded |
| `AUTH_RATE_LIMIT_EXCEEDED` | 429 | Auth endpoint rate limit exceeded |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Uploaded file type is not accepted |
| `INTERNAL_ERROR` | 500 | Unhandled server error (sanitised message; no stack trace) |
| `GATEWAY_ERROR` | 502 | Upstream microservice is unreachable |

---

## 19. HTTP Status Code Reference

| Status | Meaning | When Used |
|--------|---------|-----------|
| `200 OK` | Success | GET, PATCH, POST returning data |
| `201 Created` | Resource created | POST that creates a new resource |
| `204 No Content` | Success, no body | DELETE |
| `400 Bad Request` | Client validation error | Zod schema failure, bad file |
| `401 Unauthorized` | Auth required or failed | Missing / expired / revoked token |
| `403 Forbidden` | Access denied | Valid token, wrong role or ownership |
| `404 Not Found` | Resource missing | Entity not found; or DRAFT course accessed by student |
| `409 Conflict` | Duplicate / invalid state | Duplicate email, duplicate enrollment, wrong lifecycle state |
| `415 Unsupported Media Type` | Invalid content type | Wrong file type on upload |
| `422 Unprocessable Entity` | Business rule violation | Publish with no subjects, enroll in unpublished course |
| `429 Too Many Requests` | Rate limited | Too many requests; too-soon resubmit |
| `500 Internal Server Error` | Server fault | Unhandled exception (sanitised) |
| `502 Bad Gateway` | Upstream failure | Gateway cannot reach downstream service |
| `503 Service Unavailable` | Service not ready | Readiness probe failed |

---

## 20. Domain Events Reference

The CMP uses an event-driven architecture for side effects (notifications, audit writes). These events are published internally and are not directly accessible via the REST API. They are documented here for integration reference.

### Event Schema

All events follow this shape when dispatched:

```typescript
interface DomainEvent<T = Record<string, unknown>> {
  id:         string;    // UUID v4
  type:       string;    // Event type string
  occurredAt: string;    // ISO 8601 timestamp
  requestId:  string;    // Correlation ID (from X-Request-Id)
  payload:    T;
}
```

### Event Catalogue

| Event Type | Published By | Payload Fields | Consumed By |
|-----------|-------------|---------------|-------------|
| `user.registered` | Auth Service | `studentUid`, `email`, `firstName`, `lastName` | User Svc, Enrollment Svc, Notification Svc, Audit Svc |
| `registration.approved` | Enrollment Service | `studentUid`, `actorUid`, `registrationId` | User Svc, Notification Svc, Audit Svc |
| `registration.rejected` | Enrollment Service | `studentUid`, `actorUid`, `registrationId`, `reason?` | User Svc, Notification Svc, Audit Svc |
| `enrollment.pending` | Enrollment Service | `studentUid`, `courseId`, `enrollmentId` | Notification Svc, Audit Svc |
| `enrollment.approved` | Enrollment Service | `studentUid`, `actorUid`, `courseId`, `enrollmentId` | Notification Svc, Audit Svc |
| `enrollment.rejected` | Enrollment Service | `studentUid`, `actorUid`, `courseId`, `reason?` | Notification Svc, Audit Svc |
| `course.published` | Course Service | `actorUid`, `courseId`, `courseTitle` | Notification Svc, Audit Svc |
| `progress.subjectCompleted` | Progress Service | `studentUid`, `subjectId`, `courseId`, `source` | Progress Svc (re-aggregate), Audit Svc |
| `admin.created` | User Service | `uid`, `email`, `firstName`, `lastName`, `actorUid`, `promoted?` | Notification Svc, Audit Svc |
| `admin.suspended` | User Service | `uid`, `email`, `firstName`, `lastName` | Notification Svc, Audit Svc |
| `audit.action` | Any service | `actorUid?`, `action`, `targetType`, `targetId`, `payload`, `requestId` | Audit Svc |

### Notification Triggers

| Event | Who is notified | Channel(s) |
|-------|----------------|-----------|
| `user.registered` | All admins + registering user | In-app (admins) + email (user) |
| `registration.approved` | Student | In-app + email |
| `registration.rejected` | Student | In-app + email |
| `enrollment.pending` | All admins | In-app |
| `enrollment.approved` | Student | In-app + email + push |
| `enrollment.rejected` | Student | In-app + email |
| `course.published` | — | — |
| `admin.created` | New admin | Email (welcome or promotion notice) |
| `admin.suspended` | Suspended admin | In-app + email |

---

*© 2026 Future CX Lanka (Pvt) Ltd — Confidential*
*API Document version: 1.1.0 | Paired with CMP Backend Blueprint v1.0.0 and SRS dated 07 May 2026*
*Updated 11 May 2026 — v1.1.0: dual-role support for promoted admins (`roles[]` field); Section 14.7 added to TOC; User model updated.*
