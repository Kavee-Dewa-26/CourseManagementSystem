# CMP / TCCR — Postman Collection

API test collection for the **CMP → TCCR backend** (slp-backend).  
**130 requests** across 17 folders covering every V1 and V2 endpoint.

---

## Files in this folder

| File | What it is |
|------|-----------|
| `CMP_Backend.postman_collection.json` | Main collection — all 130 requests |
| `CMP_Local.postman_environment.json` | Local dev environment (Firebase emulator) |
| `CMP_Online.postman_environment.json` | Production environment (online Firebase) |

---

## How to import into Postman

### Step 1 — Import the collection
1. Open Postman
2. Click **Import** (top-left)
3. Drag and drop **`CMP_Backend.postman_collection.json`** (or click *Choose Files*)
4. Click **Import**

### Step 2 — Import an environment
1. Click **Import** again
2. Import **`CMP_Local.postman_environment.json`** for local dev
3. Import **`CMP_Online.postman_environment.json`** for production
4. In the top-right environment selector, choose the one you want to use

### Step 3 — Set the active environment
Click the environment dropdown (top-right of Postman) and select either:
- **CMP — Local Dev (Emulator)** → targets `http://localhost:3000/api/v1`
- **CMP Online (Production)** → targets `https://cms.api.bethelnet.au/api/v1`

---

## Prerequisites before running

### Local Dev environment
```bash
# 1. Start Firebase emulators
npx firebase emulators:start

# 2. Seed test users
node scripts/seed-emulator.js
node scripts/seed-v2-roles.js

# 3. Start all services (Docker)
docker-compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

### Production environment
All services must be deployed and the Firebase project must be live.  
No seed step needed — use real credentials.

---

## Running the collection

### Recommended order
**Always run `🔐 Sign In (get tokens)` first.**  
The sign-in requests save tokens and user IDs into environment variables automatically.  
Every other folder depends on these variables being set.

```
1. 🔐 Sign In (get tokens)        ← run ALL 6 requests here first
2. 1️⃣  Auth                       ← registers a new member (saves idToken)
3. Remaining folders in order     ← each folder builds on the previous
```

To run a full folder in sequence: right-click the folder → **Run folder**.

### Running a single request
Select any request and click **Send**.  
Variables like `{{courseId}}`, `{{userId}}` must already be set (populated by earlier requests).

---

## Test credentials (Local / Emulator only)

| Role | Email | Password |
|------|-------|----------|
| `super_admin` | `superadmin@cmp.com` | `SuperAdmin@123` |
| `admin` | `admin@cmp.com` | `Admin@12345` |
| `leader` | `leader@cmp.com` | `Leader@12345` |
| `g12` | `g12leader@cmp.com` | `G12Lead@123` |
| `student` | `student1@cmp.com` | `Student1@123` |
| `student` (2) | `student2@cmp.com` | `Student2@123` |

---

## Environment variables reference

All tokens and IDs are **auto-set by test scripts** — you never need to paste them manually.

### Auto-set by Sign In folder

| Variable | Set by | Description |
|----------|--------|-------------|
| `superAdminToken` | Sign In — super_admin | Bearer token for super_admin requests |
| `adminToken` | Sign In — admin | Bearer token for admin requests |
| `leaderToken` | Sign In — leader | Bearer token for leader requests |
| `g12Token` | Sign In — g12 | Bearer token for g12 requests |
| `studentToken` | Sign In — student1 | Bearer token for student requests |
| `student2Token` | Sign In — student2 | Bearer token for second student |
| `userId` | Sign In — student1 | UID of student1 — default target for user operations |
| `student2Id` | Sign In — student2 | UID of student2 |
| `adminId` | Sign In — admin | UID of the admin account |
| `leaderId` | Sign In — leader | UID of the leader — used as target for promote-leader-to-g12 |
| `g12Id` | Sign In — g12 | UID of the g12 account |

### Auto-set by other requests

| Variable | Set by request | Description |
|----------|---------------|-------------|
| `idToken` | Register (new member) | Token of the newly registered member |
| `registeredUid` | Register (new member) | UID of the newly registered member |
| `adminUserId` | Create Admin (Super Admin folder) | UID of the newly created admin |
| `promotedAdminId` | Promote User → Admin | UID of the user promoted to admin |
| `createdLeaderId` | Create User Directly (role=leader) | UID of a directly-created leader |
| `g12UserId` | Create User Directly (role=g12) | UID of a directly-created g12 user |
| `courseId` | Create Course | ID of the test course |
| `semesterId` | Create Semester | ID of the test semester |
| `subjectId` | Create Subject | ID of the first test subject |
| `subjectId2` | Create Subject (second call) | ID of the second test subject |
| `lessonId` | Create Lesson | ID of the test lesson |
| `batchId` | Create Batch (auto OPEN) | ID of an open batch |
| `draftBatchId` | Create Batch (DRAFT) | ID of a draft batch |
| `enrollmentId` | Enroll in Course — student V2 | ID of student1's enrollment |
| `enrollmentId2` | (second enrollment) | ID of student2's enrollment |
| `registrationId` | Register (V1 flow) | ID of V1 registration record |
| `roleRequestId` | Create Role Request | ID of the role request |
| `notificationId` | List My Notifications | ID of the first notification |
| `attachmentId` | Upload Attachment | ID of the uploaded PDF attachment |
| `imageAttachmentId` | Upload Subject Image | ID of the uploaded image |
| `cellId` | Create Cell Group | ID of the test cell group |
| `joinRequestId` | Create Join Request | ID of the join request |
| `cellReportId` | File Cell Report | ID of the filed cell report |
| `reportPhotoUrl` | Pre-Upload Report Photos | URL of a pre-uploaded report photo |

### Fixed variables (pre-configured in the environment file)

| Variable | Local value | Online value | Notes |
|----------|-------------|--------------|-------|
| `baseUrl` | `http://localhost:3000/api/v1` | `https://cms.api.bethelnet.au/api/v1` | All requests use this |
| `authBaseUrl` | `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1` | `https://identitytoolkit.googleapis.com/v1` | Sign In requests only |
| `firebaseWebApiKey` | `fake-key` | `AIzaSyDudm6...` | Sign In query param |

---

## Collection folder breakdown

| Folder | Requests | Who can run | Notes |
|--------|----------|-------------|-------|
| 🔐 Sign In (get tokens) | 6 | — | **Run this first.** Saves all tokens and user IDs. |
| 1️⃣ Auth | 7 | public / student | Register, logout, password reset, federated OAuth |
| 2️⃣ Me — Profile | 9 | student | Profile, avatar, FCM tokens, OAuth provider link |
| 3️⃣ Users (admin / leader / g12) | 16 | admin / leader / g12 | User management + promote endpoint (see below) |
| 4️⃣ Super Admin | 7 | super_admin | Admin lifecycle — create, suspend, promote to admin |
| 5️⃣ Courses | 11 | admin | Full course lifecycle (DRAFT → PUBLISHED → ARCHIVED) |
| 6️⃣ Semesters | 4 | admin | Semester CRUD |
| 7️⃣ Subjects | 4 | admin | Subject CRUD |
| 8️⃣ Lessons | 4 | admin | Lesson CRUD with YouTube video ID extraction |
| 9️⃣ Batches (V2) | 7 | admin | Batch state machine — draft/open/close |
| 🔟 Enrollments | 7 | student / admin | Enroll, withdraw, approve, reject |
| 1️⃣1️⃣ Registrations (V1 legacy) | 4 | admin | V1 registration approval queue |
| 1️⃣2️⃣ Role Requests (V2) | 6 | member / admin | Member → student/leader/g12 role request flow |
| 1️⃣3️⃣ Progress | 5 | student / admin | Subject completion, course progress |
| 1️⃣4️⃣ Attachments & Images | 4 | admin / student | Upload/download with signed URLs |
| 1️⃣5️⃣ Notifications | 3 | student | List, mark-read, mark-all-read |
| 1️⃣6️⃣ Audit Log | 2 | admin | Global log + per-user timeline |
| V2 — Cell Service | 25 | leader / g12 / admin | Cell groups, members, join requests, reports |
| 📊 Analytics (V2) | 7 | g12 / admin | Weekly/monthly dashboards, CSV export |

---

## Promote endpoint (3️⃣ Users — requests 11–16)

`POST /users/:uid/promote` — elevates a member or leader to a higher role.

| Request | Caller token | Target | Body | Expected |
|---------|-------------|--------|------|---------|
| Promote member → leader | `g12Token` | `{{userId}}` | `{"role":"leader"}` | **204** |
| Promote member → g12 | `g12Token` | `{{userId}}` | `{"role":"g12"}` | **204** |
| Promote leader → g12 | `g12Token` | `{{leaderId}}` | `{"role":"g12"}` | **204** |
| Promote member → g12 (leader caller) | `leaderToken` | `{{userId}}` | `{"role":"g12"}` | **204** |
| Leader tries → leader *(403)* | `leaderToken` | `{{userId}}` | `{"role":"leader"}` | **403** |
| Member tries promote *(403)* | `studentToken` | `{{userId}}` | `{"role":"g12"}` | **403** |

**Business rules enforced by the backend:**
- `g12` / `admin` / `super_admin` callers → may promote to `leader` or `g12`
- `leader` callers → may only promote to `g12` (cannot create more leaders)
- Targeting an `admin` or `super_admin` always returns 403
- Idempotent — repeated calls with the same role return 204 with no side effects

---

## Newman (automated CLI run)

Run the full collection headlessly against the local emulator stack:

```bash
# Prerequisites: emulators running + docker-compose.local.yml stack up
node scripts/newman-run.js
# Report: postman/newman-report.html

# Cell Service only
node scripts/newman-cell-service.js
# Report: postman/newman-cell-report.html
```
