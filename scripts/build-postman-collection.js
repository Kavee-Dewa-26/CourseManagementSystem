'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uuid = () => crypto.randomUUID();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bearerAuth(tokenVar) {
  return {
    type: 'bearer',
    bearer: [{ key: 'token', value: `{{${tokenVar}}}`, type: 'string' }],
  };
}

function noAuth() {
  return { type: 'noauth' };
}

function jsonHeader() {
  return [{ key: 'Content-Type', value: 'application/json' }];
}

function jsonBody(obj) {
  return {
    mode: 'raw',
    raw: JSON.stringify(obj, null, 2),
    options: { raw: { language: 'json' } },
  };
}

function noBody() {
  return null;
}

function queryParams(obj) {
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: String(value),
    disabled: false,
  }));
}

function testScript(lines) {
  return [
    {
      listen: 'test',
      script: {
        id: uuid(),
        type: 'text/javascript',
        exec: Array.isArray(lines) ? lines : [lines],
      },
    },
  ];
}

function buildRequest({
  name,
  method,
  url,
  auth,
  headers = [],
  body = null,
  query = null,
  tests = [],
}) {
  const urlObj =
    typeof url === 'string'
      ? { raw: query ? `${url}?${new URLSearchParams(query).toString()}` : url }
      : url;

  if (query) {
    urlObj.raw = `${url}?${Object.entries(query)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')}`;
    urlObj.query = queryParams(query);
  }

  return {
    id: uuid(),
    name,
    request: {
      method,
      header: headers,
      body: body || undefined,
      url: urlObj,
      auth: auth || noAuth(),
    },
    response: [],
    event: tests.length ? testScript(tests) : undefined,
  };
}

function folder(name, items) {
  return {
    id: uuid(),
    name,
    item: items.filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// 🔐 SIGN IN FOLDER
// ---------------------------------------------------------------------------

function signInRequest(name, email, password, tokenVar, idVar) {
  return buildRequest({
    name,
    method: 'POST',
    url: {
      raw: '{{authBaseUrl}}/accounts:signInWithPassword?key={{firebaseWebApiKey}}',
      host: ['{{authBaseUrl}}'],
      path: ['accounts:signInWithPassword'],
      query: [{ key: 'key', value: '{{firebaseWebApiKey}}' }],
    },
    auth: noAuth(),
    headers: jsonHeader(),
    body: jsonBody({ email, password, returnSecureToken: true }),
    tests: [
      `pm.test("200 OK — ${name}", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("TOKEN received", () => {`,
      `  pm.expect(j.idToken).to.be.a("string").and.not.empty;`,
      `  if (j.idToken) { pm.environment.set("${tokenVar}", j.idToken); pm.environment.set("${idVar}", j.localId); }`,
      `});`,
    ],
  });
}

const signInFolder = folder('🔐 Sign In', [
  signInRequest('Super Admin Sign In', 'superadmin@cmp.com', 'SuperAdmin@123', 'superAdminToken', 'superAdminId'),
  signInRequest('Admin Sign In', 'admin@cmp.com', 'Admin@12345', 'adminToken', 'adminId'),
  signInRequest('Student 1 (pending) Sign In', 'student1@cmp.com', 'Student1@123', 'studentToken', 'studentId'),
  signInRequest('Student 2 (approved) Sign In', 'student2@cmp.com', 'Student2@123', 'student2Token', 'student2Id'),
  signInRequest('Leader Sign In', 'leader@cmp.com', 'Leader@12345', 'leaderToken', 'leaderId'),
  signInRequest('G12 Sign In', 'g12leader@cmp.com', 'G12Lead@123', 'g12Token', 'g12Id'),
]);

// ---------------------------------------------------------------------------
// 1️⃣ AUTH SERVICE
// ---------------------------------------------------------------------------

const authFolder = folder('1️⃣ Auth Service', [
  buildRequest({
    name: 'Register New Member',
    method: 'POST',
    url: { raw: '{{baseUrl}}/auth/register' },
    auth: noAuth(),
    headers: jsonHeader(),
    body: jsonBody({
      firstName: 'New',
      lastName: 'Member',
      email: 'newmember@test.com',
      password: 'Member@123',
      preferredLanguage: 'en',
    }),
    tests: [`pm.test("201 Created — Register", () => pm.response.to.have.status(201));`],
  }),
  buildRequest({
    name: 'Request Password Reset',
    method: 'POST',
    url: { raw: '{{baseUrl}}/auth/password-reset' },
    auth: noAuth(),
    headers: jsonHeader(),
    body: jsonBody({ email: 'student2@cmp.com' }),
    tests: [`pm.test("204 No Content — Password Reset", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Verify OTP (Password Reset)',
    method: 'POST',
    url: { raw: '{{baseUrl}}/auth/password-reset/verify' },
    auth: noAuth(),
    headers: jsonHeader(),
    body: jsonBody({ email: 'student2@cmp.com', otp: '123456' }),
    tests: [
      `pm.test("No 500 error — Password Reset Verify", () => {`,
      `  pm.expect(pm.response.code).to.not.equal(500);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Track Login Failure',
    method: 'POST',
    url: { raw: '{{baseUrl}}/auth/track-failure' },
    auth: noAuth(),
    headers: jsonHeader(),
    body: jsonBody({ email: 'student2@cmp.com' }),
    tests: [`pm.test("204 No Content — Track Failure", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Logout',
    method: 'POST',
    url: { raw: '{{baseUrl}}/auth/logout' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: noBody(),
    tests: [`pm.test("204 No Content — Logout", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Federated Login (Google)',
    method: 'POST',
    url: { raw: '{{baseUrl}}/auth/federated/google' },
    auth: noAuth(),
    headers: jsonHeader(),
    body: jsonBody({
      idToken: Buffer.from(JSON.stringify({ email: 'federated@test.com', sub: 'google-uid-test', name: 'Federated User' })).toString('base64'),
      preferredLanguage: 'en',
    }),
    tests: [
      `pm.test("No 500 error — Federated Login", () => {`,
      `  pm.expect(pm.response.code).to.not.equal(500);`,
      `});`,
    ],
  }),
]);

// ---------------------------------------------------------------------------
// 2️⃣ USER SERVICE — Me
// ---------------------------------------------------------------------------

const meFolder = folder('2️⃣ User Service — Me', [
  buildRequest({
    name: 'Get My Profile',
    method: 'GET',
    url: { raw: '{{baseUrl}}/me' },
    auth: bearerAuth('student2Token'),
    tests: [
      `pm.test("200 OK — Get Profile", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `if (j.uid) { pm.environment.set("userId", j.uid); }`,
    ],
  }),
  buildRequest({
    name: 'Update My Profile',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/me' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ firstName: 'Updated', lastName: 'Student', preferredLanguage: 'si' }),
    tests: [`pm.test("200 OK — Update Profile", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Change Password',
    method: 'POST',
    url: { raw: '{{baseUrl}}/me/change-password' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ currentPassword: 'Student2@123', newPassword: 'Student2@NewPass!' }),
    tests: [`pm.test("204 No Content — Change Password", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Register FCM Token',
    method: 'POST',
    url: { raw: '{{baseUrl}}/me/fcm-token' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ token: 'fcm-test-token-abc123' }),
    tests: [`pm.test("204 No Content — Register FCM Token", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Delete FCM Token',
    method: 'DELETE',
    url: { raw: '{{baseUrl}}/me/fcm-token' },
    auth: bearerAuth('student2Token'),
    tests: [`pm.test("204 No Content — Delete FCM Token", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Update Notification Preferences',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/me/notifications/preferences' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ email: true, push: false }),
    tests: [`pm.test("204 No Content — Update Preferences", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Get My Notifications',
    method: 'GET',
    url: { raw: '{{baseUrl}}/me/notifications?limit=10' },
    auth: bearerAuth('student2Token'),
    query: { limit: '10' },
    tests: [
      `pm.test("200 OK — Get Notifications", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Mark All Notifications Read',
    method: 'POST',
    url: { raw: '{{baseUrl}}/me/notifications/read-all' },
    auth: bearerAuth('student2Token'),
    tests: [`pm.test("204 No Content — Read All", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Link OAuth Provider',
    method: 'POST',
    url: { raw: '{{baseUrl}}/me/providers/link' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ provider: 'google', idToken: 'test-google-token' }),
    tests: [
      `pm.test("No 500 error — Link Provider", () => {`,
      `  pm.expect(pm.response.code).to.not.equal(500);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Unlink OAuth Provider',
    method: 'DELETE',
    url: { raw: '{{baseUrl}}/me/providers/google' },
    auth: bearerAuth('student2Token'),
    tests: [
      `pm.test("No 500 error — Unlink Provider", () => {`,
      `  pm.expect(pm.response.code).to.not.equal(500);`,
      `});`,
    ],
  }),
]);

// ---------------------------------------------------------------------------
// 3️⃣ USER SERVICE — Admin Manage Users
// ---------------------------------------------------------------------------

const adminUsersFolder = folder('3️⃣ User Service — Admin Manage Users', [
  buildRequest({
    name: 'List Users (Admin)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/users?limit=20' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 OK — List Users", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Search Users by Name (Admin)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/users?name=Test' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 OK — Search Users", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Search Users by Name (Leader)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/users?name=Saman' },
    auth: bearerAuth('leaderToken'),
    tests: [
      `pm.test("200 OK — Leader Search Users", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
      `pm.test("no admin in results", () => {`,
      `  (j.items || []).forEach(u => {`,
      `    pm.expect((u.roles || []).includes("admin")).to.be.false;`,
      `  });`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Search Users by Name (G12)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/users?name=Test' },
    auth: bearerAuth('g12Token'),
    tests: [
      `pm.test("200 OK — G12 Search Users", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Create User (Admin)',
    method: 'POST',
    url: { raw: '{{baseUrl}}/users' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({
      firstName: 'Saman',
      lastName: 'Silva',
      email: 'saman.leader@tccr.lk',
      initialPassword: 'Leader@12345',
      role: 'leader',
    }),
    tests: [
      `pm.test("201 Created — Create User", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.uid) { pm.environment.set("createdLeaderId", j.uid); }`,
    ],
  }),
  buildRequest({
    name: 'Get User by ID',
    method: 'GET',
    url: { raw: '{{baseUrl}}/users/{{student2Id}}' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Get User", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Suspend User',
    method: 'POST',
    url: { raw: '{{baseUrl}}/users/{{student2Id}}/suspend' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Suspend User", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Reactivate User',
    method: 'POST',
    url: { raw: '{{baseUrl}}/users/{{student2Id}}/reactivate' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Reactivate User", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Update User Roles',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/users/{{student2Id}}/roles' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ role: 'student', action: 'add' }),
    tests: [`pm.test("204 No Content — Update Roles", () => pm.response.to.have.status(204));`],
  }),
]);

// ---------------------------------------------------------------------------
// 4️⃣ USER SERVICE — Super Admin
// ---------------------------------------------------------------------------

const superAdminFolder = folder('4️⃣ User Service — Super Admin', [
  buildRequest({
    name: 'List Admins',
    method: 'GET',
    url: { raw: '{{baseUrl}}/super-admin/admins' },
    auth: bearerAuth('superAdminToken'),
    tests: [
      `pm.test("200 OK — List Admins", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Create Admin',
    method: 'POST',
    url: { raw: '{{baseUrl}}/super-admin/admins' },
    auth: bearerAuth('superAdminToken'),
    headers: jsonHeader(),
    body: jsonBody({
      firstName: 'New',
      lastName: 'Admin',
      email: 'newadmin@tccr.lk',
      initialPassword: 'Admin@Tccr2026',
    }),
    tests: [
      `pm.test("201 Created — Create Admin", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.uid) { pm.environment.set("promotedAdminId", j.uid); }`,
    ],
  }),
  buildRequest({
    name: 'Get Admin by ID',
    method: 'GET',
    url: { raw: '{{baseUrl}}/super-admin/admins/{{promotedAdminId}}' },
    auth: bearerAuth('superAdminToken'),
    tests: [`pm.test("200 OK — Get Admin", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Suspend Admin',
    method: 'POST',
    url: { raw: '{{baseUrl}}/super-admin/admins/{{promotedAdminId}}/suspend' },
    auth: bearerAuth('superAdminToken'),
    tests: [`pm.test("200 OK — Suspend Admin", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Reactivate Admin',
    method: 'POST',
    url: { raw: '{{baseUrl}}/super-admin/admins/{{promotedAdminId}}/reactivate' },
    auth: bearerAuth('superAdminToken'),
    tests: [`pm.test("200 OK — Reactivate Admin", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Make User Admin',
    method: 'POST',
    url: { raw: '{{baseUrl}}/super-admin/users/{{student2Id}}/make-admin' },
    auth: bearerAuth('superAdminToken'),
    tests: [`pm.test("200 OK — Make Admin", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Delete Admin',
    method: 'DELETE',
    url: { raw: '{{baseUrl}}/super-admin/admins/{{promotedAdminId}}' },
    auth: bearerAuth('superAdminToken'),
    tests: [`pm.test("204 No Content — Delete Admin", () => pm.response.to.have.status(204));`],
  }),
]);

// ---------------------------------------------------------------------------
// 5️⃣ COURSE SERVICE — Build a Course
// ---------------------------------------------------------------------------

const buildCourseFolder = folder('5️⃣ Course Service — Build a Course', [
  buildRequest({
    name: 'Create Course',
    method: 'POST',
    url: { raw: '{{baseUrl}}/courses' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({
      title: 'Introduction to Faith',
      description: 'A foundational course for new believers.',
      coverImageUrl: null,
    }),
    tests: [
      `pm.test("201 Created — Create Course", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("courseId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'List Courses (public)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/courses?limit=20' },
    auth: noAuth(),
    tests: [`pm.test("200 OK — List Courses", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Search Courses by Title',
    method: 'GET',
    url: { raw: '{{baseUrl}}/courses?title=Intro' },
    auth: noAuth(),
    tests: [`pm.test("200 OK — Search Courses", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Get Course by ID',
    method: 'GET',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}' },
    auth: noAuth(),
    tests: [`pm.test("200 OK — Get Course", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Update Course',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({
      title: 'Introduction to Faith (Updated)',
      description: 'Updated description.',
    }),
    tests: [`pm.test("200 OK — Update Course", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Create Semester',
    method: 'POST',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/semesters' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ title: 'Semester 1 — Foundations' }),
    tests: [
      `pm.test("201 Created — Create Semester", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("semesterId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'Update Semester',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/semesters/{{semesterId}}' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ title: 'Semester 1 — Foundations (Updated)' }),
    tests: [`pm.test("200 OK — Update Semester", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Create Subject 1',
    method: 'POST',
    url: { raw: '{{baseUrl}}/semesters/{{semesterId}}/subjects' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ title: 'Who is God?' }),
    tests: [
      `pm.test("201 Created — Create Subject 1", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("subjectId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'Create Subject 2',
    method: 'POST',
    url: { raw: '{{baseUrl}}/semesters/{{semesterId}}/subjects' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ title: 'Prayer and Worship' }),
    tests: [
      `pm.test("201 Created — Create Subject 2", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("subjectId2", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'Update Subject',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/subjects/{{subjectId}}' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ title: 'Who is God? (Updated)' }),
    tests: [`pm.test("200 OK — Update Subject", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'List Semesters',
    method: 'GET',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/semesters' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — List Semesters", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'List Subjects',
    method: 'GET',
    url: { raw: '{{baseUrl}}/semesters/{{semesterId}}/subjects' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — List Subjects", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Create Lesson',
    method: 'POST',
    url: { raw: '{{baseUrl}}/subjects/{{subjectId}}/lessons' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({
      title: 'God the Father',
      description: 'Understanding the Father heart of God.',
      youtubeVideoId: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      attachmentIds: [],
    }),
    tests: [
      `pm.test("201 Created — Create Lesson", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("lessonId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'Update Lesson',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/lessons/{{lessonId}}' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({
      title: 'God the Father (Updated)',
      description: 'Revised lesson content.',
    }),
    tests: [`pm.test("200 OK — Update Lesson", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'List Lessons',
    method: 'GET',
    url: { raw: '{{baseUrl}}/subjects/{{subjectId}}/lessons' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — List Lessons", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Publish Course',
    method: 'POST',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/publish' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Publish Course", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Unpublish Course',
    method: 'POST',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/unpublish' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Unpublish Course", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Re-publish Course',
    method: 'POST',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/publish' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Re-publish Course", () => pm.response.to.have.status(200));`],
  }),
]);

// ---------------------------------------------------------------------------
// 6️⃣ BATCHES (V2)
// ---------------------------------------------------------------------------

const batchesFolder = folder('6️⃣ Batches (V2)', [
  buildRequest({
    name: 'Create Batch',
    method: 'POST',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/batches' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({
      name: 'Batch 2026 — Q1',
      scheduledOpenAt: '2026-01-01T00:00:00Z',
      scheduledCloseAt: '2026-06-30T23:59:59Z',
    }),
    tests: [
      `pm.test("201 Created — Create Batch", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("batchId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'List Batches',
    method: 'GET',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/batches' },
    auth: noAuth(),
    tests: [`pm.test("200 OK — List Batches", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Get Batch by ID',
    method: 'GET',
    url: { raw: '{{baseUrl}}/batches/{{batchId}}' },
    auth: noAuth(),
    tests: [`pm.test("200 OK — Get Batch", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Update Batch',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/batches/{{batchId}}' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ name: 'Batch 2026 — Q1 (Updated)' }),
    tests: [`pm.test("200 OK — Update Batch", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Open Batch',
    method: 'POST',
    url: { raw: '{{baseUrl}}/batches/{{batchId}}/open' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Open Batch", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Close Batch',
    method: 'POST',
    url: { raw: '{{baseUrl}}/batches/{{batchId}}/close' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Close Batch", () => pm.response.to.have.status(200));`],
  }),
]);

// ---------------------------------------------------------------------------
// 7️⃣ ENROLLMENT
// ---------------------------------------------------------------------------

const enrollmentFolder = folder('7️⃣ Enrollment', [
  buildRequest({
    name: 'Enroll in Course',
    method: 'POST',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/enroll' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: noBody(),
    tests: [
      `pm.test("201 or 409 — Enroll", () => {`,
      `  pm.expect([201, 409]).to.include(pm.response.code);`,
      `});`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("enrollmentId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'Get My Enrollments',
    method: 'GET',
    url: { raw: '{{baseUrl}}/me/enrollments' },
    auth: bearerAuth('student2Token'),
    tests: [
      `pm.test("200 OK — Get Enrollments", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
      `if (j.items && j.items.length > 0 && !pm.environment.get("enrollmentId")) {`,
      `  pm.environment.set("enrollmentId", j.items[0].id);`,
      `}`,
    ],
  }),
  buildRequest({
    name: 'List Registrations (Admin)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/admin/registrations' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 OK — List Registrations", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
      `if (j.items && j.items.length > 0 && !pm.environment.get("registrationId")) {`,
      `  pm.environment.set("registrationId", j.items[0].id);`,
      `}`,
    ],
  }),
  buildRequest({
    name: 'Approve Registration',
    method: 'POST',
    url: { raw: '{{baseUrl}}/admin/registrations/{{registrationId}}/approve' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 or 404 — Approve Registration", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Reject Registration',
    method: 'POST',
    url: { raw: '{{baseUrl}}/admin/registrations/{{registrationId}}/reject' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ reason: 'Does not meet requirements.' }),
    tests: [
      `pm.test("200 or 404 — Reject Registration", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Bulk Approve Registrations',
    method: 'POST',
    url: { raw: '{{baseUrl}}/admin/registrations/bulk-approve' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ ids: ['{{registrationId}}'] }),
    tests: [`pm.test("200 OK — Bulk Approve", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'List Enrollments (Admin)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/admin/enrollments' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 OK — List Enrollments", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Approve Enrollment',
    method: 'POST',
    url: { raw: '{{baseUrl}}/admin/enrollments/{{enrollmentId}}/approve' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 or 404 — Approve Enrollment", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Reject Enrollment',
    method: 'POST',
    url: { raw: '{{baseUrl}}/admin/enrollments/{{enrollmentId}}/reject' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ reason: 'Enrollment rejected for testing.' }),
    tests: [
      `pm.test("200 or 404 — Reject Enrollment", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Withdraw Enrollment',
    method: 'POST',
    url: { raw: '{{baseUrl}}/enrollments/{{enrollmentId}}/withdraw' },
    auth: bearerAuth('student2Token'),
    tests: [
      `pm.test("200 or 404 — Withdraw Enrollment", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
]);

// ---------------------------------------------------------------------------
// 8️⃣ ROLE REQUESTS (V2)
// ---------------------------------------------------------------------------

const roleRequestsFolder = folder('8️⃣ Role Requests (V2)', [
  buildRequest({
    name: 'Create Role Request',
    method: 'POST',
    url: { raw: '{{baseUrl}}/role-requests' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ requestedRole: 'student' }),
    tests: [
      `pm.test("201 or 409 — Create Role Request", () => {`,
      `  pm.expect([201, 409]).to.include(pm.response.code);`,
      `});`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("roleRequestId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'Get My Role Requests',
    method: 'GET',
    url: { raw: '{{baseUrl}}/role-requests/mine' },
    auth: bearerAuth('student2Token'),
    tests: [
      `pm.test("200 OK — Get My Role Requests", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
      `if (j.items && j.items.length > 0 && !pm.environment.get("roleRequestId")) {`,
      `  pm.environment.set("roleRequestId", j.items[0].id);`,
      `}`,
    ],
  }),
  buildRequest({
    name: 'List Role Requests (Admin)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/role-requests' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 OK — List Role Requests", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Approve Role Request',
    method: 'POST',
    url: { raw: '{{baseUrl}}/role-requests/{{roleRequestId}}/approve' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 or 404 — Approve Role Request", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Reject Role Request',
    method: 'POST',
    url: { raw: '{{baseUrl}}/role-requests/{{roleRequestId}}/reject' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ note: 'Rejected for testing.' }),
    tests: [
      `pm.test("200 or 404 — Reject Role Request", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
]);

// ---------------------------------------------------------------------------
// 9️⃣ PROGRESS SERVICE
// ---------------------------------------------------------------------------

const progressFolder = folder('9️⃣ Progress Service', [
  buildRequest({
    name: 'Mark Subject Complete',
    method: 'POST',
    url: { raw: '{{baseUrl}}/progress/subjects/{{subjectId}}/complete' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ courseId: '{{courseId}}', semesterId: '{{semesterId}}' }),
    tests: [
      `pm.test("200 or 201 — Mark Complete", () => {`,
      `  pm.expect([200, 201]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Record Subject Access',
    method: 'POST',
    url: { raw: '{{baseUrl}}/progress/subjects/{{subjectId}}/access' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ courseId: '{{courseId}}', semesterId: '{{semesterId}}' }),
    tests: [
      `pm.test("200 or 201 — Record Access", () => {`,
      `  pm.expect([200, 201]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Get My Course Progress',
    method: 'GET',
    url: { raw: '{{baseUrl}}/me/progress/courses/{{courseId}}' },
    auth: bearerAuth('student2Token'),
    tests: [`pm.test("200 OK — Get Course Progress", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Get My Subject Progress',
    method: 'GET',
    url: { raw: '{{baseUrl}}/me/progress/subjects/{{subjectId}}' },
    auth: bearerAuth('student2Token'),
    tests: [
      `pm.test("200 or 404 — Get Subject Progress", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Get Course Progress (Admin)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/admin/progress/courses/{{courseId}}' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Admin Course Progress", () => pm.response.to.have.status(200));`],
  }),
]);

// ---------------------------------------------------------------------------
// 🔔 NOTIFICATIONS
// ---------------------------------------------------------------------------

const notificationsFolder = folder('🔔 Notifications', [
  buildRequest({
    name: 'Get My Notifications',
    method: 'GET',
    url: { raw: '{{baseUrl}}/me/notifications?limit=20' },
    auth: bearerAuth('student2Token'),
    tests: [
      `pm.test("200 OK — Get Notifications", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
      `if (j.items && j.items.length > 0) { pm.environment.set("notificationId", j.items[0].id); }`,
    ],
  }),
  buildRequest({
    name: 'Mark Notification Read',
    method: 'POST',
    url: { raw: '{{baseUrl}}/me/notifications/{{notificationId}}/read' },
    auth: bearerAuth('student2Token'),
    tests: [
      `pm.test("200 or 404 — Mark Read", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Mark All Notifications Read',
    method: 'POST',
    url: { raw: '{{baseUrl}}/me/notifications/read-all' },
    auth: bearerAuth('student2Token'),
    tests: [`pm.test("204 No Content — Read All", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Update Notification Preferences',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/me/notifications/preferences' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ email: true, push: false }),
    tests: [`pm.test("204 No Content — Update Preferences", () => pm.response.to.have.status(204));`],
  }),
]);

// ---------------------------------------------------------------------------
// 📎 STORAGE SERVICE
// ---------------------------------------------------------------------------

const storageFolder = folder('📎 Storage Service', [
  {
    id: uuid(),
    name: 'Upload Attachment (file upload — see note)',
    request: {
      method: 'POST',
      header: [],
      body: {
        mode: 'formdata',
        formdata: [
          {
            key: 'attachment',
            type: 'file',
            src: '',
            description: 'Select a PDF or DOCX file (max 25 MB). This is a multipart/form-data upload.',
          },
        ],
      },
      url: { raw: '{{baseUrl}}/subjects/{{subjectId}}/attachments' },
      auth: bearerAuth('adminToken'),
      description: 'Multipart file upload. Select a real PDF/DOCX file in Postman before sending. Max 25 MB. Returns attachment metadata including the attachment ID.',
    },
    response: [],
    event: testScript([
      `pm.test("201 Created or 400/415 — Upload Attachment", () => {`,
      `  pm.expect([201, 400, 415]).to.include(pm.response.code);`,
      `});`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("attachmentId", j.id); }`,
    ]),
  },
  buildRequest({
    name: 'Get Attachment Download URL',
    method: 'GET',
    url: { raw: '{{baseUrl}}/attachments/{{attachmentId}}/download-url' },
    auth: bearerAuth('student2Token'),
    tests: [
      `pm.test("200 or 403 or 404 — Download URL", () => {`,
      `  pm.expect([200, 403, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Delete Attachment',
    method: 'DELETE',
    url: { raw: '{{baseUrl}}/attachments/{{attachmentId}}' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("204 or 404 — Delete Attachment", () => {`,
      `  pm.expect([204, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
]);

// ---------------------------------------------------------------------------
// 📋 AUDIT LOG
// ---------------------------------------------------------------------------

const auditLogFolder = folder('📋 Audit Log', [
  buildRequest({
    name: 'List Audit Log',
    method: 'GET',
    url: { raw: '{{baseUrl}}/audit-log?limit=20' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 OK — List Audit Log", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'List Audit Log by Actor',
    method: 'GET',
    url: { raw: '{{baseUrl}}/audit-log?actorUid={{adminId}}' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Audit Log by Actor", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Get User Audit Log',
    method: 'GET',
    url: { raw: '{{baseUrl}}/users/{{student2Id}}/audit-log' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — User Audit Log", () => pm.response.to.have.status(200));`],
  }),
]);

// ---------------------------------------------------------------------------
// ⚡ COURSE LIFECYCLE
// ---------------------------------------------------------------------------

const courseLifecycleFolder = folder('⚡ Course Lifecycle', [
  buildRequest({
    name: 'Archive Course',
    method: 'POST',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/archive' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Archive Course", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Restore Course',
    method: 'POST',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}/restore' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("200 OK — Restore Course", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Delete Lesson',
    method: 'DELETE',
    url: { raw: '{{baseUrl}}/lessons/{{lessonId}}' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("204 No Content — Delete Lesson", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Delete Subject 2',
    method: 'DELETE',
    url: { raw: '{{baseUrl}}/subjects/{{subjectId2}}' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("204 No Content — Delete Subject 2", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Delete Semester',
    method: 'DELETE',
    url: { raw: '{{baseUrl}}/semesters/{{semesterId}}' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("204 No Content — Delete Semester", () => pm.response.to.have.status(204));`],
  }),
  buildRequest({
    name: 'Delete Course',
    method: 'DELETE',
    url: { raw: '{{baseUrl}}/courses/{{courseId}}' },
    auth: bearerAuth('adminToken'),
    tests: [`pm.test("204 No Content — Delete Course", () => pm.response.to.have.status(204));`],
  }),
]);

// ---------------------------------------------------------------------------
// 🏘 V2 — CELL SERVICE
// ---------------------------------------------------------------------------

const memberSearchSubFolder = folder('Member Search', [
  buildRequest({
    name: 'Search Members by Name (Leader)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/users?name=Saman' },
    auth: bearerAuth('leaderToken'),
    tests: [
      `pm.test("200 OK — Leader Member Search", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
      `pm.test("no admin in results", () => {`,
      `  (j.items || []).forEach(u => {`,
      `    pm.expect((u.roles || []).includes("admin")).to.be.false;`,
      `  });`,
      `});`,
      `if (j.items && j.items.length > 0) { pm.environment.set("foundMemberUid", j.items[0].uid); }`,
    ],
  }),
  buildRequest({
    name: 'Search Members by Name (G12)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/users?name=Test' },
    auth: bearerAuth('g12Token'),
    tests: [
      `pm.test("200 OK — G12 Member Search", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
]);

const cellCrudSubFolder = folder('Cell CRUD', [
  buildRequest({
    name: 'Create Cell Group',
    method: 'POST',
    url: { raw: '{{baseUrl}}/cells' },
    auth: bearerAuth('leaderToken'),
    headers: jsonHeader(),
    body: jsonBody({
      name: 'Bethel Cell Group A',
      type: 'care',
      area: 'Colombo 05',
      g12LeaderUid: '{{leaderId}}',
    }),
    tests: [
      `pm.test("201 Created — Create Cell", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("cellId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'List Cell Groups',
    method: 'GET',
    url: { raw: '{{baseUrl}}/cells?limit=20' },
    auth: bearerAuth('leaderToken'),
    tests: [
      `pm.test("200 OK — List Cells", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Get Cell Group by ID',
    method: 'GET',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}' },
    auth: bearerAuth('leaderToken'),
    tests: [`pm.test("200 OK — Get Cell", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Update Cell Group',
    method: 'PATCH',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}' },
    auth: bearerAuth('leaderToken'),
    headers: jsonHeader(),
    body: jsonBody({ name: 'Bethel Cell Group A (Updated)', area: 'Colombo 06' }),
    tests: [`pm.test("200 OK — Update Cell", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Get My Cell Groups',
    method: 'GET',
    url: { raw: '{{baseUrl}}/cells/mine' },
    auth: bearerAuth('leaderToken'),
    tests: [`pm.test("200 OK — Get My Cells", () => pm.response.to.have.status(200));`],
  }),
]);

const membersSubFolder = folder('Members', [
  buildRequest({
    name: 'Add Member to Cell',
    method: 'POST',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/members' },
    auth: bearerAuth('leaderToken'),
    headers: jsonHeader(),
    body: jsonBody({ userUids: ['{{student2Id}}'] }),
    tests: [`pm.test("200 OK — Add Member", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Remove Member from Cell',
    method: 'DELETE',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/members/{{student2Id}}' },
    auth: bearerAuth('leaderToken'),
    tests: [`pm.test("204 No Content — Remove Member", () => pm.response.to.have.status(204));`],
  }),
]);

const joinRequestsSubFolder = folder('Join Requests', [
  buildRequest({
    name: 'Create Join Request',
    method: 'POST',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/join-requests' },
    auth: bearerAuth('student2Token'),
    headers: jsonHeader(),
    body: jsonBody({ message: 'I would like to join this cell group.' }),
    tests: [
      `pm.test("201 Created — Join Request", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("joinRequestId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'List Join Requests',
    method: 'GET',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/join-requests?limit=20' },
    auth: bearerAuth('leaderToken'),
    tests: [
      `pm.test("200 OK — List Join Requests", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Approve Join Request',
    method: 'POST',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/join-requests/{{joinRequestId}}/approve' },
    auth: bearerAuth('adminToken'),
    tests: [
      `pm.test("200 or 404 — Approve Join Request", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
  buildRequest({
    name: 'Reject Join Request',
    method: 'POST',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/join-requests/{{joinRequestId}}/reject' },
    auth: bearerAuth('adminToken'),
    headers: jsonHeader(),
    body: jsonBody({ note: 'Rejected for testing.' }),
    tests: [
      `pm.test("200 or 404 — Reject Join Request", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
]);

const cellReportsSubFolder = folder('Cell Reports', [
  buildRequest({
    name: 'File Cell Report',
    method: 'POST',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/reports' },
    auth: bearerAuth('leaderToken'),
    headers: jsonHeader(),
    body: jsonBody({
      date: '2026-05-18',
      didMeet: true,
      leaderPresent: true,
      conductedByIfAbsent: null,
      location: 'Leader Home',
      timeStarted: '17:00',
      timeEnded: '19:00',
      language: 'en',
      subjectDiscussed: 'sunday_sermon',
      otherSubjectReason: null,
      cellType: 'care',
      g12LeaderUid: '{{leaderId}}',
      immediateG12LeaderText: null,
      attendance: [
        { name: 'Saman Silva', status: 'present', isNew: false },
        { name: 'Kamala Perera', status: 'present', isNew: true },
      ],
      contactedAbsentees: 'no',
      absenteeNotes: null,
      additionalVisitors: 0,
      childrenCount: 2,
      satisfactionRate: 5,
      additionalInfo: null,
      photoUrls: [],
      clientReqId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      noMeetReason: null,
    }),
    tests: [
      `pm.test("201 Created — File Cell Report", () => pm.response.to.have.status(201));`,
      `const j = pm.response.json();`,
      `if (j.id) { pm.environment.set("cellReportId", j.id); }`,
    ],
  }),
  buildRequest({
    name: 'List Cell Reports',
    method: 'GET',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/reports?limit=20' },
    auth: bearerAuth('leaderToken'),
    tests: [
      `pm.test("200 OK — List Cell Reports", () => pm.response.to.have.status(200));`,
      `const j = pm.response.json();`,
      `pm.test("items is array", () => pm.expect(j.items).to.be.an("array"));`,
    ],
  }),
  buildRequest({
    name: 'Get Cell Report by ID',
    method: 'GET',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/reports/{{cellReportId}}' },
    auth: bearerAuth('leaderToken'),
    tests: [`pm.test("200 OK — Get Cell Report", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Void Cell Report',
    method: 'POST',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/reports/{{cellReportId}}/void' },
    auth: bearerAuth('leaderToken'),
    headers: jsonHeader(),
    body: jsonBody({ reason: 'Test void reason.' }),
    tests: [
      `pm.test("200 or 404 — Void Cell Report", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
]);

const cellArchiveSubFolder = folder('Archive', [
  buildRequest({
    name: 'Archive Cell Group',
    method: 'POST',
    url: { raw: '{{baseUrl}}/cells/{{cellId}}/archive' },
    auth: bearerAuth('leaderToken'),
    tests: [`pm.test("200 OK — Archive Cell", () => pm.response.to.have.status(200));`],
  }),
]);

const cellServiceFolder = folder('🏘 V2 — Cell Service', [
  memberSearchSubFolder,
  cellCrudSubFolder,
  membersSubFolder,
  joinRequestsSubFolder,
  cellReportsSubFolder,
  cellArchiveSubFolder,
]);

// ---------------------------------------------------------------------------
// 📊 V2 — ANALYTICS SERVICE
// ---------------------------------------------------------------------------

const analyticsFolder = folder('📊 V2 — Analytics Service', [
  buildRequest({
    name: 'Weekly Cell Analytics',
    method: 'GET',
    url: { raw: '{{baseUrl}}/analytics/cells/weekly?weeks=12' },
    auth: bearerAuth('g12Token'),
    tests: [`pm.test("200 OK — Weekly Analytics", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Attendance Analytics',
    method: 'GET',
    url: { raw: '{{baseUrl}}/analytics/attendance' },
    auth: bearerAuth('g12Token'),
    tests: [`pm.test("200 OK — Attendance Analytics", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Meeting Types Analytics',
    method: 'GET',
    url: { raw: '{{baseUrl}}/analytics/meeting-types' },
    auth: bearerAuth('g12Token'),
    tests: [`pm.test("200 OK — Meeting Types Analytics", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Growth Analytics',
    method: 'GET',
    url: { raw: '{{baseUrl}}/analytics/growth' },
    auth: bearerAuth('g12Token'),
    tests: [`pm.test("200 OK — Growth Analytics", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Participation Analytics',
    method: 'GET',
    url: { raw: '{{baseUrl}}/analytics/participation' },
    auth: bearerAuth('g12Token'),
    tests: [`pm.test("200 OK — Participation Analytics", () => pm.response.to.have.status(200));`],
  }),
  buildRequest({
    name: 'Export Weekly Analytics (CSV)',
    method: 'GET',
    url: { raw: '{{baseUrl}}/analytics/weekly/export?weeks=12' },
    auth: bearerAuth('g12Token'),
    tests: [
      `pm.test("200 or 404 — Export Analytics", () => {`,
      `  pm.expect([200, 404]).to.include(pm.response.code);`,
      `});`,
    ],
  }),
]);

// ---------------------------------------------------------------------------
// 🏥 HEALTH CHECKS
// ---------------------------------------------------------------------------

const healthFolder = folder('🏥 Health Checks', [
  buildRequest({
    name: 'Gateway Health Check',
    method: 'GET',
    url: { raw: 'http://localhost:3000/healthz' },
    auth: noAuth(),
    tests: [`pm.test("200 OK — Health Check", () => pm.response.to.have.status(200));`],
  }),
]);

// ---------------------------------------------------------------------------
// ASSEMBLE COLLECTION
// ---------------------------------------------------------------------------

const collection = {
  info: {
    _postman_id: uuid(),
    name: 'TCCR Backend — Full API Collection',
    description:
      'Complete API test collection for TCCR (The Christian Center Rathmalana) backend. Covers all V1 and V2 endpoints across 10 microservices.\n\nTest flow:\n1. Run 🔐 Sign In first to populate all tokens\n2. Run folders in order (1️⃣ → 📊)\n3. Each folder may depend on IDs saved by previous folders\n\nPrerequisites:\n- Firebase emulators running: npx firebase emulators:start\n- Services running: docker-compose -f docker-compose.yml -f docker-compose.local.yml up\n- Seeded: node scripts/seed-emulator.js && node scripts/seed-v2-roles.js',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [
    signInFolder,
    authFolder,
    meFolder,
    adminUsersFolder,
    superAdminFolder,
    buildCourseFolder,
    batchesFolder,
    enrollmentFolder,
    roleRequestsFolder,
    progressFolder,
    notificationsFolder,
    storageFolder,
    auditLogFolder,
    courseLifecycleFolder,
    cellServiceFolder,
    analyticsFolder,
    healthFolder,
  ],
};

// ---------------------------------------------------------------------------
// WRITE OUTPUT
// ---------------------------------------------------------------------------

const outputPath = path.join(__dirname, '..', 'postman', 'CMP_Backend.postman_collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), 'utf8');

const totalRequests = (function countRequests(items) {
  let count = 0;
  for (const item of items) {
    if (item.request) {
      count += 1;
    } else if (item.item) {
      count += countRequests(item.item);
    }
  }
  return count;
})(collection.item);

console.log(`Collection written to: ${outputPath}`);
console.log(`Total folders: ${collection.item.length}`);
console.log(`Total requests: ${totalRequests}`);
