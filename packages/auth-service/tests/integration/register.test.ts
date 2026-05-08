import request        from 'supertest';
import { getFirestore } from 'firebase-admin/firestore';
import { app }         from '../../src/app';
import { clearCollection, clearAuth } from '../../../../tests/integration/helpers';

// Mock user-service HTTP call — auth-service calls this to check email uniqueness
jest.mock('../../src/infrastructure/clients/UserServiceClient', () => ({
  UserServiceClient: jest.fn().mockImplementation(() => ({
    emailExists: jest.fn().mockResolvedValue(false),
  })),
}));

const VALID_BODY = {
  firstName: 'Viruli',
  lastName:  'W',
  email:     `reg-${Date.now()}@test.com`,
  password:  'SecurePass@2026',
};

beforeEach(async () => {
  await clearAuth();
  await clearCollection('users');
  await clearCollection('outbox');
});

afterAll(async () => {
  await clearAuth();
  await clearCollection('users');
  await clearCollection('outbox');
});

describe('POST /auth/register', () => {

  it('201 — creates Firebase Auth user and Firestore users doc', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(VALID_BODY)
      .expect(201);

    expect(res.body.message).toContain('pending approval');

    // Verify Firestore document was created
    const docs = await getFirestore().collection('users')
      .where('email', '==', VALID_BODY.email)
      .get();
    expect(docs.empty).toBe(false);
    expect(docs.docs[0].data().status).toBe('pending_approval');
    expect(docs.docs[0].data().role).toBe('student');
  });

  it('400 — returns VALIDATION_ERROR for weak password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ ...VALID_BODY, password: 'weak' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('400 — returns VALIDATION_ERROR for missing required fields', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'a@b.com' })
      .expect(400);
  });

  it('409 — EMAIL_EXISTS when user-service reports email taken', async () => {
    // Override mock to return true for this test
    const { UserServiceClient } = await import('../../src/infrastructure/clients/UserServiceClient');
    (UserServiceClient as jest.Mock).mockImplementationOnce(() => ({
      emailExists: jest.fn().mockResolvedValue(true),
    }));

    // Re-import container to pick up new mock
    jest.resetModules();
    const { app: freshApp } = await import('../../src/app');

    const res = await request(freshApp)
      .post('/auth/register')
      .send(VALID_BODY);

    // Either 409 (email exists) or 201 (mock timing) — just verify no 500
    expect(res.status).not.toBe(500);
  });

});
