"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const firestore_1 = require("firebase-admin/firestore");
exports.healthRouter = (0, express_1.Router)();
// Liveness — process is alive
exports.healthRouter.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: process.env.SERVICE_NAME });
});
// Readiness — Firestore is reachable
exports.healthRouter.get('/readyz', async (_req, res) => {
    try {
        await (0, firestore_1.getFirestore)().collection('_health').doc('probe').get();
        res.json({ status: 'ready' });
    }
    catch {
        res.status(503).json({ status: 'not_ready', error: 'Firestore unreachable' });
    }
});
//# sourceMappingURL=healthRouter.js.map