/**
 * Runs in the same Jest VM context BEFORE each test file is loaded.
 * Sets Firebase emulator environment variables so that all subsequent
 * require() / import() calls within the test file use the emulator.
 * Also initialises the Firebase Admin SDK once so container.ts can
 * call getFirestore() / getAuth() without throwing.
 */

// ── Emulator hosts ────────────────────────────────────────────────────────────
process.env.FIRESTORE_EMULATOR_HOST    = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

// ── Fake Firebase credentials (accepted by emulator) ─────────────────────────
process.env.FIREBASE_PROJECT_ID    = 'demo-cmp';
process.env.FIREBASE_CLIENT_EMAIL  = 'fake@fake.com';
process.env.FIREBASE_PRIVATE_KEY   = '-----BEGIN PRIVATE KEY-----\nMIIFAKE\n-----END PRIVATE KEY-----\n';
process.env.FIREBASE_STORAGE_BUCKET = 'demo-cmp.appspot.com';
process.env.FIREBASE_WEB_API_KEY   = 'fake-key';

// ── Service configuration ─────────────────────────────────────────────────────
process.env.INTERNAL_SERVICE_KEY   = 'test-secret';
process.env.NODE_ENV               = 'test';
process.env.LOG_LEVEL              = 'silent';

// ── Initialise Firebase Admin SDK ─────────────────────────────────────────────
// Must run before any module that calls getFirestore() / getAuth() is loaded.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { initFirebaseAdmin } = require('./../../packages/shared/firebase/src/index');
initFirebaseAdmin();
