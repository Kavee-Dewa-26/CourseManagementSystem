"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFirebaseAdmin = initFirebaseAdmin;
const app_1 = require("firebase-admin/app");
function initFirebaseAdmin() {
    if ((0, app_1.getApps)().length > 0)
        return;
    const isEmulator = !!(process.env.FIRESTORE_EMULATOR_HOST ||
        process.env.FIREBASE_AUTH_EMULATOR_HOST);
    if (isEmulator) {
        // Emulator mode — no real service account needed
        (0, app_1.initializeApp)({
            projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-cmp',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    }
    else {
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    }
}
//# sourceMappingURL=index.js.map