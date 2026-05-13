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
   - 2.4 [Track Login Failure](#24-post-authtrack-failure)
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
   - 6.4 [List Lessons](#64-get-subjectsidlessons)
   - 6.5 [Create Lesson](#65-post-subjectsidlessons)
   - 6.6 [Update Lesson](#66-patch-lessonsid)
   - 6.7 [Delete Lesson](#67-delete-lessonsid)
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
15. [Audit Log — Admin & Super Admin](#15-audit-log--admin--super-admin)
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

**`204 No Content`** — Logged out successfully (empty body)

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

**`204 No Content`** — Reset email sent if account exists (empty body — always 204 regardless of whether the email exists, to prevent enumeration)

---

### 2.4 `POST /auth/track-failure`

Record a failed login attempt for a given email. Called by the client after each failed sign-in. After **10 failures within a 15-minute window**, the account is automatically locked (Firebase Auth `disabled: true`).

**Authentication:** None (public — called before the user has a token)

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
  "locked":   false,
  "attempts": 3
}
```

| Field | Type | Description |
|-------|------|-------------|
| `locked` | `boolean` | `true` when attempt count hit the lockout threshold (≥ 10) |
| `attempts` | `number` | Total failed attempts in the current 15-minute window |

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
  "currentPassword": "OldSecurePass@2026",
  "newPassword":     "NewSecurePass@2026"
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `currentPassword` | `string` | Yes | Current password (verified server-side via Firebase Identity Toolkit) |
| `newPassword` | `string` | Yes | Min 10 chars · uppercase · lowercase · number · special character |

#### Responses

**`204 No Content`** — Password updated successfully (empty body)

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
| `description` | `string` | Yes | 1–2000 characters |
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
  "title":       "Semester 1 — Foundations",
  "description": "Core foundational topics."
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `title` | `string` | Yes | 1–200 characters |
| `description` | `string` | No | Max 1000 characters |

#### Responses

**`201 Created`**
```json
{
  "id":           "sem-001",
  "courseId":     "course-abc",
  "title":        "Semester 1 — Foundations",
  "description":  "Core foundational topics.",
  "subjectCount": 0,
  "order":        1,
  "deletedAt":    null,
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
  "title":       "Semester 1 — Core Foundations",
  "description": "Updated description."
}
```

All fields optional.

#### Responses

**`200 OK`** — Updated semester object (same shape as `POST /courses/:id/semesters` response)

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
  "youtubeVideoId": "zQnBQ4tB3ZA",
  "attachmentIds":  []
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `title` | `string` | Yes | 1–200 characters |
| `description` | `string` | No | Max 2000 characters |
| `youtubeVideoId` | `string \| null` | No | Exactly 11 characters matching `[A-Za-z0-9_-]{11}` — pass the raw video ID, **not** a full YouTube URL |
| `attachmentIds` | `string[]` | No | Array of existing attachment document IDs |

> **Important:** `youtubeVideoId` accepts only the raw 11-character video ID (e.g. `zQnBQ4tB3ZA`), not a full YouTube URL. Sending a full URL will return `400 INVALID_YOUTUBE_ID`.

#### Responses

**`201 Created`**
```json
{
  "id":             "sub-001",
  "semesterId":     "sem-001",
  "courseId":       "course-abc",
  "title":          "TypeScript Basics",
  "description":    "Variables, types, interfaces, and enums.",
  "youtubeVideoId": "zQnBQ4tB3ZA",
  "attachmentIds":  [],
  "order":          1,
  "deletedAt":      null,
  "createdAt":      "2026-05-01T09:00:00.000Z",
  "updatedAt":      "2026-05-01T09:00:00.000Z"
}
```

**`400 Bad Request`**
```json
{
  "error": {
    "code":    "INVALID_YOUTUBE_ID",
    "message": "YouTube video ID must be 11 chars."
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
  "youtubeVideoId": "newVideoId11c"
}
```

All fields optional. Same validation rules as `POST /semesters/:id/subjects`.

#### Responses

**`200 OK`** — Updated subject object (same shape as `POST /semesters/:id/subjects` response)

---

### 6.3 `DELETE /subjects/:id`

Soft-delete a subject.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Responses

**`204 No Content`**

---

### 6.4 `GET /subjects/:id/lessons`

List all lessons for a subject, ordered by `order` ascending.

**Authentication:** Bearer token required
**Roles:** `student`, `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Subject document ID |

#### Responses

**`200 OK`**
```json
[
  {
    "id":          "lesson-001",
    "subjectId":   "sub-001",
    "courseId":    "course-abc",
    "semesterId":  "sem-001",
    "title":       "Introduction to TypeScript",
    "description": "Overview of TypeScript features.",
    "url":         "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order":       1,
    "deletedAt":   null,
    "createdAt":   "2026-05-12T09:00:00.000Z",
    "updatedAt":   "2026-05-12T09:00:00.000Z"
  }
]
```

---

### 6.5 `POST /subjects/:id/lessons`

Add a new lesson to a subject. Lessons support any valid video URL (YouTube, Vimeo, direct video links, etc.). Order is assigned automatically.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Subject document ID |

#### Request Body

```json
{
  "title":       "Introduction to TypeScript",
  "url":         "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "description": "Overview of TypeScript features."
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `title` | `string` | **Yes** | Lesson title (max 200 chars) |
| `url` | `string` | **Yes** | Any valid video URL (YouTube, Vimeo, etc.) |
| `description` | `string` | No | Lesson description (max 2000 chars) |

#### Responses

**`201 Created`**
```json
{
  "id":          "lesson-001",
  "subjectId":   "sub-001",
  "courseId":    "course-abc",
  "semesterId":  "sem-001",
  "title":       "Introduction to TypeScript",
  "description": "Overview of TypeScript features.",
  "url":         "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "order":       1,
  "deletedAt":   null,
  "createdAt":   "2026-05-12T09:00:00.000Z",
  "updatedAt":   "2026-05-12T09:00:00.000Z"
}
```

**`404 Not Found`** — Subject does not exist or is deleted

---

### 6.6 `PATCH /lessons/:id`

Update a lesson's title, URL, or description. Only provided fields are changed.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Lesson document ID |

#### Request Body

```json
{
  "title":       "Introduction to TypeScript — Revised",
  "url":         "https://vimeo.com/123456789",
  "description": "Updated lesson description."
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `title` | `string` | No | New lesson title (max 200 chars) |
| `url` | `string` | No | New video URL (must be a valid URL) |
| `description` | `string` | No | New description (max 2000 chars) |

#### Responses

**`200 OK`** — Updated lesson object

**`404 Not Found`** — Lesson does not exist or is deleted

---

### 6.7 `DELETE /lessons/:id`

Soft-delete a lesson.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Responses

**`204 No Content`**

**`404 Not Found`** — Lesson does not exist or is deleted

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
  "id":          "att-001",
  "subjectId":   "sub-001",
  "courseId":    "course-abc",
  "filename":    "lesson-notes.pdf",
  "mimeType":    "application/pdf",
  "sizeBytes":   204800,
  "storagePath": "attachments/course-abc/sub-001/att-001.pdf",
  "createdAt":   "2026-05-02T10:00:00.000Z"
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

**`409 Conflict`** — Already enrolled (pending)
```json
{
  "error": {
    "code":    "ENROLLMENT_PENDING",
    "message": "You already have a pending enrollment for this course."
  },
  "requestId": "..."
}
```

**`409 Conflict`** — Already enrolled (approved)
```json
{
  "error": {
    "code":    "ALREADY_ENROLLED",
    "message": "You are already enrolled in this course."
  },
  "requestId": "..."
}
```

**`404 Not Found`** — Course is not published or does not exist
```json
{
  "error": {
    "code":    "COURSE_NOT_FOUND",
    "message": "Course not found or not published."
  },
  "requestId": "..."
}
```

**`422 Unprocessable Entity`** — Resubmitting before the cool-off period (24h after rejection)
```json
{
  "error": {
    "code":    "COOLOFF_ACTIVE",
    "message": "You must wait before resubmitting an enrollment request for this course."
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
| `limit` | `number` | `20` | Items per page (max 100) |
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
| `status` | `string` | — | Filter by status: `pending`, `approved`, `rejected` (omit to return all) |
| `limit` | `number` | `20` | Items per page (max 100) |
| `cursor` | `string` | — | Pagination cursor |

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

**`200 OK`** — Full updated Registration object
```json
{
  "id":         "firebase-uid-abc123",
  "studentUid": "firebase-uid-abc123",
  "email":      "viruli@example.com",
  "firstName":  "Viruli",
  "lastName":   "Weerasinghe",
  "state":      "approved",
  "reason":     null,
  "createdAt":  "2026-05-05T08:00:00.000Z",
  "updatedAt":  "2026-05-06T09:00:00.000Z"
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

**`200 OK`** — Full updated Registration object
```json
{
  "id":         "firebase-uid-abc123",
  "studentUid": "firebase-uid-abc123",
  "email":      "viruli@example.com",
  "firstName":  "Viruli",
  "lastName":   "Weerasinghe",
  "state":      "rejected",
  "reason":     "Incomplete registration information.",
  "createdAt":  "2026-05-05T08:00:00.000Z",
  "updatedAt":  "2026-05-06T09:00:00.000Z"
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
  "ids": ["reg-001", "reg-002", "reg-003"]
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `ids` | `string[]` | Yes | 1–100 registration IDs per request |

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
| `status` | `string` | — | Filter by status: `pending`, `approved`, `rejected`, `withdrawn` |
| `courseId` | `string` | — | Filter by specific course |
| `limit` | `number` | `20` | Items per page (max 100) |
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
  "courseId":   "course-abc",
  "semesterId": "sem-001"
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `courseId` | `string` | **Yes** | Course the subject belongs to |
| `semesterId` | `string` | **Yes** | Semester the subject belongs to |

#### Responses

**`200 OK`**
```json
{
  "studentUid":     "firebase-uid-abc123",
  "subjectId":      "sub-001",
  "courseId":       "course-abc",
  "semesterId":     "sem-001",
  "state":          "completed",
  "completedAt":    "2026-05-07T14:00:00.000Z",
  "lastAccessedAt": "2026-05-07T14:00:00.000Z"
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

```json
{
  "courseId":   "course-abc",
  "semesterId": "sem-001"
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `courseId` | `string` | **Yes** | Course the subject belongs to |
| `semesterId` | `string` | **Yes** | Semester the subject belongs to |

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

#### Responses

**`200 OK`** — Array of raw subject progress records for all students in the course
```json
[
  {
    "studentUid":        "firebase-uid-abc123",
    "subjectId":         "sub-001",
    "courseId":          "course-abc",
    "semesterId":        "sem-001",
    "state":             "completed",
    "completionSource":  "manual",
    "completedAt":       "2026-05-07T14:00:00.000Z",
    "lastAccessedAt":    "2026-05-07T14:00:00.000Z"
  }
]
```

> Returns a flat array of `SubjectProgress` records (not paginated). Each record is one subject completion entry for one student.

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
| `read` | `'true'` \| `'false'` | — | Filter by read state: `read=false` returns only unread, `read=true` returns only read |
| `limit` | `number` | `20` | Items per page (max 100) |
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
  "total": 3
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
  "id":   "notif-001",
  "read": true
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

**`204 No Content`** — All notifications marked as read (empty body)

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
| `role` | `string` | — | Filter by role |
| `limit` | `number` | `20` | Items per page (max 100) |
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



---

### 13.2 `GET /users/:uid`

Get a specific user's full profile.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID |

#### Responses

**`200 OK`** — Full User object (same shape as `GET /me`)
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
  "updatedAt":       "2026-05-05T10:30:00.000Z",
  "deletedAt":       null
}
```

**`404 Not Found`**
```json
{
  "error": { "code": "USER_NOT_FOUND", "message": "User not found." },
  "requestId": "..."
}
```

---

### 13.3 `POST /users/:uid/suspend`

Suspend a user account. Disables Firebase Auth login for the user.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID |

#### Request Body

None.

#### Responses

**`200 OK`** — Full updated User object with `status: "suspended"`

**`404 Not Found`**
```json
{
  "error": { "code": "USER_NOT_FOUND", "message": "User not found." },
  "requestId": "..."
}
```

---

### 13.4 `POST /users/:uid/reactivate`

Reactivate a suspended user account. Re-enables Firebase Auth login.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID |

#### Request Body

None.

#### Responses

**`200 OK`** — Full updated User object with `status: "approved"`

**`404 Not Found`**
```json
{
  "error": { "code": "USER_NOT_FOUND", "message": "User not found." },
  "requestId": "..."
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
| `limit` | `number` | `20` | Items per page (max 100) |
| `cursor` | `string` | — | Pagination cursor |

#### Responses

**`200 OK`**
```json
{
  "items": [
    {
      "uid":             "admin-uid-xyz",
      "email":           "admin@cmp.com",
      "role":            "admin",
      "roles":           ["admin"],
      "status":          "approved",
      "firstName":       "Sapna",
      "lastName":        "Nethmini",
      "profilePhotoUrl": null,
      "createdAt":       "2026-04-01T08:00:00.000Z",
      "updatedAt":       "2026-04-01T08:00:00.000Z",
      "deletedAt":       null
    }
  ],
  "nextCursor": null,
  "total": 3
}
```

---

### 14.2 `POST /super-admin/admins`

Create a new admin account directly (no approval needed). The admin can log in immediately.

**Side effects:** An `admin.created` outbox event is published (triggers an audit log entry).

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Request Body

```json
{
  "firstName":       "Sapna",
  "lastName":        "Nethmini",
  "email":           "sapna@cmp.com",
  "initialPassword": "SecureAdmin@2026"
}
```

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `firstName` | `string` | Yes | 1-100 characters |
| `lastName` | `string` | Yes | 1-100 characters |
| `email` | `string` | Yes | Valid email; must be unique |
| `initialPassword` | `string` | Yes | Min 10 chars, uppercase, lowercase, number, special character |

#### Responses

**`201 Created`** — Full User object for the new admin
```json
{
  "uid":             "admin-uid-xyz",
  "email":           "sapna@cmp.com",
  "role":            "admin",
  "roles":           ["admin"],
  "status":          "approved",
  "firstName":       "Sapna",
  "lastName":        "Nethmini",
  "profilePhotoUrl": null,
  "createdAt":       "2026-05-01T08:00:00.000Z",
  "updatedAt":       "2026-05-01T08:00:00.000Z",
  "deletedAt":       null
}
```

**`409 Conflict`** — Email already registered
```json
{
  "error": { "code": "EMAIL_EXISTS", "message": "This email address is already registered." },
  "requestId": "..."
}
```

---

### 14.3 `GET /super-admin/admins/:uid`

Get a specific admin's full profile.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID |

#### Responses

**`200 OK`** — Full User object (same shape as 14.2 response)

**`404 Not Found`**
```json
{
  "error": { "code": "USER_NOT_FOUND", "message": "User not found." },
  "requestId": "..."
}
```

---

### 14.4 `POST /super-admin/admins/:uid/suspend`

Suspend an admin account. Publishes an `admin.suspended` outbox event (triggers notification + audit).

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID |

#### Request Body

None.

#### Responses

**`200 OK`** — Full updated User object with `status: "suspended"`

**`404 Not Found`**
```json
{
  "error": { "code": "USER_NOT_FOUND", "message": "User not found." },
  "requestId": "..."
}
```

---

### 14.5 `POST /super-admin/admins/:uid/reactivate`

Reactivate a suspended admin account.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID |

#### Request Body

None.

#### Responses

**`200 OK`** — Full updated User object with `status: "approved"`

**`404 Not Found`**
```json
{
  "error": { "code": "USER_NOT_FOUND", "message": "User not found." },
  "requestId": "..."
}
```

---

### 14.6 `DELETE /super-admin/admins/:uid`

Soft-delete an admin account. Sets `deletedAt` and disables Firebase Auth login.

> Only users with `role: "admin"` can be deleted via this endpoint. Attempting to delete a non-admin returns `404`.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID |

#### Responses

**`204 No Content`** — Deleted successfully (empty body)

**`404 Not Found`** — User not found or is not an admin
```json
{
  "error": { "code": "USER_NOT_FOUND", "message": "User not found." },
  "requestId": "..."
}
```

---

### 14.7 `POST /super-admin/users/:uid/make-admin`

Promote an existing student to admin. The user retains their student role and gains admin capabilities simultaneously (dual-role).

**Side effects:** An `admin.created` outbox event is published with `promoted: true` in the payload.

**Authentication:** Bearer token required
**Roles:** `super_admin`

#### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `uid` | Firebase Auth UID of the student to promote |

#### Request Body

None.

#### Responses

**`200 OK`** — Full updated User object
```json
{
  "uid":             "firebase-uid-abc123",
  "email":           "viruli@example.com",
  "role":            "admin",
  "roles":           ["student", "admin"],
  "status":          "approved",
  "firstName":       "Viruli",
  "lastName":        "Weerasinghe",
  "profilePhotoUrl": null,
  "createdAt":       "2026-05-01T08:00:00.000Z",
  "updatedAt":       "2026-05-10T11:00:00.000Z",
  "deletedAt":       null
}
```

**`404 Not Found`** — User not found
```json
{
  "error": { "code": "USER_NOT_FOUND", "message": "User not found." },
  "requestId": "..."
}
```

**`409 Conflict`** — User is not a student
```json
{
  "error": { "code": "INVALID_ROLE", "message": "Only students can be promoted to admin." },
  "requestId": "..."
}
```

---

## 15. Audit Log — Admin & Super Admin

---

### 15.1 `GET /audit-log`

Query the append-only audit log. Entries are created automatically by the outbox-worker; no direct write API exists.

**Authentication:** Bearer token required
**Roles:** `admin`, `super_admin`

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|:-------:|-------------|
| `actorUid` | `string` | — | Filter by the UID of the user who performed the action |
| `action` | `string` | — | Filter by action string (exact match) |
| `category` | `string` | — | Filter by category (exact match) |
| `targetType` | `string` | — | Filter by target entity type (exact match) |
| `targetId` | `string` | — | Filter by target entity ID (exact match) |
| `from` | `string` | — | ISO 8601 datetime — return entries at or after this timestamp |
| `to` | `string` | — | ISO 8601 datetime — return entries at or before this timestamp |
| `limit` | `number` | `20` | Items per page (max 100) |
| `cursor` | `string` | — | Document ID cursor for pagination |

#### Responses

**`200 OK`**
```json
{
  "items": [
    {
      "id":         "log-001",
      "when":       "2026-05-07T14:00:00.000Z",
      "actor":      { "uid": "admin-uid-xyz", "email": "admin@cmp.com" },
      "action":     "enrollment.approved",
      "category":   "enrollment",
      "ip":         "203.0.113.42",
      "targetType": "enrollment",
      "targetId":   "enr-abc",
      "requestId":  "7f3a1c2d-4e5b-6f7a-8b9c-0d1e2f3a4b5c"
    }
  ],
  "nextCursor": null,
  "total": 142
}
```

| Field | Description |
|-------|-------------|
| `when` | Timestamp the event was recorded (mapped from internal `createdAt`) |
| `actor` | The user who triggered the action; `uid` and `email` may be `null` for system events |
| `action` | String identifier (e.g. `enrollment.approved`, `user.registered`) |
| `category` | Logical grouping (e.g. `enrollment`, `auth`, `course`) |
| `targetType` | The type of entity affected (e.g. `user`, `enrollment`, `course`) |
| `targetId` | The ID of the affected entity |
| `requestId` | The `X-Request-Id` from the originating HTTP request |

> The raw `payload` field is intentionally excluded from the response.

---

## 16. Health Endpoints

Health endpoints are exposed by every service. The gateway does not proxy them — use direct service URLs in Kubernetes probes.

---

### 16.1 `GET /healthz`

Liveness probe. Returns `200` if the process is running.

**Authentication:** None (public)

#### Responses

**`200 OK`**
```json
{ "status": "ok" }
```

---

### 16.2 `GET /readyz`

Readiness probe. Returns `200` when the service is ready to accept traffic.

**Authentication:** None (public)

#### Responses

**`200 OK`**
```json
{ "status": "ok" }
```

---

## 17. Data Models

---

### User

| Field | Type | Notes |
|-------|------|-------|
| `uid` | `string` | Firebase Auth UID |
| `email` | `string` | |
| `firstName` | `string` | |
| `lastName` | `string` | |
| `role` | `string` | Primary role: `student`, `admin`, or `super_admin` |
| `roles` | `string[]` | All roles held (e.g. `["student","admin"]` for promoted users) |
| `status` | `string` | `pending_approval`, `approved`, `rejected`, or `suspended` |
| `profilePhotoUrl` | `string or null` | |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string` | ISO 8601 |
| `deletedAt` | `string or null` | Non-null means soft-deleted |

---

### Course

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Auto UUID |
| `title` | `string` | Unique |
| `description` | `string` | Max 2000 characters |
| `coverImageUrl` | `string or null` | |
| `state` | `string` | `draft`, `published`, or `archived` |
| `semesterCount` | `number` | |
| `createdBy` | `string` | Admin UID |
| `createdByName` | `string` | Display name at time of creation |
| `publishedAt` | `string or null` | ISO 8601 |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string` | ISO 8601 |
| `deletedAt` | `string or null` | |

---

### Semester

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Auto UUID |
| `courseId` | `string` | |
| `title` | `string` | |
| `description` | `string` | |
| `subjectCount` | `number` | |
| `order` | `number` | Display order within course |
| `deletedAt` | `string or null` | |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string` | ISO 8601 |

---

### Subject

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Auto UUID |
| `semesterId` | `string` | |
| `courseId` | `string` | |
| `title` | `string` | |
| `description` | `string` | |
| `youtubeVideoId` | `string or null` | Raw 11-char ID only — not a full URL |
| `attachmentIds` | `string[]` | IDs of associated Attachment documents |
| `order` | `number` | Display order within semester |
| `deletedAt` | `string or null` | |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string` | ISO 8601 |

---

### Lesson

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Auto UUID |
| `subjectId` | `string` | |
| `courseId` | `string` | |
| `semesterId` | `string` | |
| `title` | `string` | |
| `description` | `string or null` | |
| `url` | `string` | Any valid video URL |
| `order` | `number` | Auto-assigned; sequential within subject |
| `deletedAt` | `string or null` | |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string` | ISO 8601 |

---

### Attachment

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Auto UUID |
| `subjectId` | `string` | |
| `courseId` | `string` | |
| `filename` | `string` | Original file name (lowercase n) |
| `mimeType` | `string` | e.g. `application/pdf` |
| `sizeBytes` | `number` | |
| `storagePath` | `string` | Internal Cloud Storage path |
| `createdAt` | `string` | ISO 8601 |

---

### Enrollment

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | `${studentUid}_${courseId}` |
| `studentUid` | `string` | |
| `courseId` | `string` | |
| `courseTitle` | `string` | |
| `state` | `string` | `pending`, `approved`, `rejected`, or `withdrawn` |
| `approvedAt` | `string or null` | ISO 8601 |
| `rejectedAt` | `string or null` | ISO 8601 |
| `reason` | `string or null` | Rejection reason |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string` | ISO 8601 |

---

### Registration

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Firebase Auth UID (same as `studentUid`) |
| `studentUid` | `string` | |
| `email` | `string` | |
| `firstName` | `string` | |
| `lastName` | `string` | |
| `state` | `string` | `pending`, `approved`, or `rejected` |
| `reason` | `string or null` | Rejection reason |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string` | ISO 8601 |

---

### SubjectProgress

| Field | Type | Notes |
|-------|------|-------|
| `studentUid` | `string` | |
| `subjectId` | `string` | |
| `courseId` | `string` | |
| `semesterId` | `string` | |
| `state` | `string` | `in_progress` or `completed` |
| `completionSource` | `string or null` | `manual` or `auto` |
| `completedAt` | `string or null` | ISO 8601; immutable once set |
| `lastAccessedAt` | `string or null` | ISO 8601 |

---

### Notification

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Auto UUID |
| `userUid` | `string` | |
| `category` | `string` | e.g. `enrollment_approved`, `registration_approved` |
| `title` | `string` | |
| `body` | `string` | |
| `payload` | `object` | Event-specific context |
| `readAt` | `string or null` | ISO 8601; null when unread |
| `createdAt` | `string` | ISO 8601 |

---

### AuditLogEntry (response shape)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Auto UUID |
| `when` | `string` | ISO 8601 (mapped from internal `createdAt`) |
| `actor` | `object` | `{ uid: string or null, email: string or null }` |
| `action` | `string` | |
| `category` | `string or null` | |
| `ip` | `string or null` | |
| `targetType` | `string or null` | |
| `targetId` | `string or null` | |
| `requestId` | `string` | |

> `payload` is stored internally but not included in API responses.

---

## 18. Error Codes Reference

| Code | Status | Description |
|------|:------:|-------------|
| `VALIDATION_ERROR` | 400 | Zod schema validation failed; `details` contains field-level errors |
| `INVALID_YOUTUBE_ID` | 400 | `youtubeVideoId` is not a valid 11-character ID |
| `FILE_TOO_LARGE` | 400 | Uploaded file exceeds the 25 MB limit |
| `MISSING_TOKEN` | 401 | `Authorization` header is absent |
| `INVALID_TOKEN` | 401 | Token is expired, revoked, or malformed |
| `FORBIDDEN` | 403 | Valid token, insufficient role or ownership |
| `ENROLLMENT_REQUIRED` | 403 | Student must have an approved enrollment to access this resource |
| `COURSE_NOT_FOUND` | 404 | Course does not exist, is soft-deleted, or not published (for student/public requests) |
| `USER_NOT_FOUND` | 404 | User does not exist or is soft-deleted |
| `SUBJECT_NOT_FOUND` | 404 | Subject does not exist or is soft-deleted |
| `LESSON_NOT_FOUND` | 404 | Lesson does not exist or is soft-deleted |
| `ATTACHMENT_NOT_FOUND` | 404 | Attachment does not exist |
| `REGISTRATION_NOT_FOUND` | 404 | Registration record not found |
| `ENROLLMENT_NOT_FOUND` | 404 | Enrollment record not found |
| `EMAIL_EXISTS` | 409 | Email address is already registered |
| `COURSE_TITLE_EXISTS` | 409 | A course with this title already exists |
| `ENROLLMENT_PENDING` | 409 | Student already has a pending enrollment for this course |
| `ALREADY_ENROLLED` | 409 | Student already has an approved enrollment for this course |
| `INVALID_STATE` | 409 | Entity is not in the required state for this operation |
| `INVALID_ROLE` | 409 | User role does not permit this operation |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Uploaded file MIME type is not allowed (only PDF, DOC, DOCX) |
| `COOLOFF_ACTIVE` | 422 | Student must wait before resubmitting an enrollment request |
| `EMPTY_SEMESTER` | 422 | Cannot publish: at least one semester has no subjects |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests — see `Retry-After` header |

---

## 19. HTTP Status Code Reference

| Status | Meaning | When used |
|:------:|---------|-----------|
| `200` | OK | Successful GET, PATCH, POST (non-creating) |
| `201` | Created | Successful POST that creates a resource |
| `204` | No Content | Successful DELETE; also logout, password-reset, change-password, mark-all-read |
| `400` | Bad Request | Zod validation failure |
| `401` | Unauthorized | Missing, expired, or revoked token |
| `403` | Forbidden | Valid token, wrong role or ownership |
| `404` | Not Found | Resource not found; draft/archived course accessed by student |
| `409` | Conflict | Duplicate email, duplicate enrollment, invalid state transition, invalid role |
| `415` | Unsupported Media Type | Invalid attachment MIME type |
| `422` | Unprocessable Entity | Business rule violation (cooloff active, empty semester on publish) |
| `429` | Too Many Requests | Rate limit exceeded |

---

## 20. Domain Events Reference

Events published to the `outbox` Firestore collection and dispatched by the outbox-worker.

| Event Type | Published By | Consumers | Trigger |
|-----------|-------------|-----------|---------|
| `user.registered` | auth-service | notify, audit | Student completes registration |
| `registration.approved` | enrollment-service | user-service `/internal/users/approve`, notify, audit | Admin approves registration |
| `registration.rejected` | enrollment-service | notify, audit | Admin rejects registration |
| `enrollment.pending` | enrollment-service | notify, audit | Student submits enrollment request |
| `enrollment.approved` | enrollment-service | notify, audit | Admin approves enrollment |
| `enrollment.rejected` | enrollment-service | notify, audit | Admin rejects enrollment |
| `enrollment.withdrawn` | enrollment-service | audit | Student withdraws enrollment |
| `course.published` | course-service | notify, audit | Admin publishes a course |
| `progress.subjectCompleted` | progress-service | audit | Student marks a subject complete |
| `admin.created` | user-service | audit | Super admin creates or promotes an admin |
| `admin.suspended` | user-service | notify, audit | Admin account is suspended |
| `audit.action` | any service | audit | Direct audit event |

**Delivery guarantees:**
- At-least-once delivery; outbox-worker retries up to **5 times**
- Events that fail all 5 attempts remain as `status: "failed"` in `outbox` for manual investigation
- Within a single event, handlers run sequentially — a handler failure stops remaining handlers and triggers a retry on the next poll cycle
- Across a batch, `Promise.allSettled` ensures one event failure does not block others in the same poll cycle
