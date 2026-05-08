"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendPaginated = sendPaginated;
function sendSuccess(res, data, status = 200) {
    res.status(status).json(data);
}
function sendPaginated(res, items, nextCursor, total) {
    res.status(200).json({ items, nextCursor, total });
}
//# sourceMappingURL=index.js.map