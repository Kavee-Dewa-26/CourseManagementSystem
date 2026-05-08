"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxEventPublisher = void 0;
const firestore_1 = require("firebase-admin/firestore");
const uuid_1 = require("uuid");
class OutboxEventPublisher {
    db = (0, firestore_1.getFirestore)();
    async publishWithBatch(event, batch) {
        const entry = {
            id: (0, uuid_1.v4)(),
            eventType: event.type,
            payload: event.payload,
            requestId: event.requestId,
            status: 'pending',
            attempts: 0,
            createdAt: new Date().toISOString(),
            processedAt: null,
            error: null,
        };
        const ref = this.db.collection('outbox').doc();
        if (batch) {
            batch.set(ref, entry);
        }
        else {
            await ref.set(entry);
        }
    }
}
exports.OutboxEventPublisher = OutboxEventPublisher;
//# sourceMappingURL=OutboxEventPublisher.js.map