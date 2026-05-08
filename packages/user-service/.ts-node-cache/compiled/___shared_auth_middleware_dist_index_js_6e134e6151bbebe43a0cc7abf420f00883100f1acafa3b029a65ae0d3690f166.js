"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.mustBeOwnerOrAdmin = mustBeOwnerOrAdmin;
const auth_1 = require("firebase-admin/auth");
const errors_1 = require("@shared/errors");
// ── authenticate ─────────────────────────────────────────────────────────────
function authenticate() {
    return async (req, _res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return next((0, errors_1.createHttpError)(401, 'UNAUTHENTICATED', 'Authentication required.'));
        }
        const token = authHeader.slice(7);
        try {
            const decoded = await (0, auth_1.getAuth)().verifyIdToken(token, true); // checkRevoked=true
            const role = decoded.role;
            if (!role) {
                return next((0, errors_1.createHttpError)(401, 'INVALID_TOKEN', 'Token is missing role claim.'));
            }
            req.principal = {
                uid: decoded.uid,
                email: decoded.email ?? '',
                role,
            };
            next();
        }
        catch (err) {
            const code = err.code;
            if (code === 'auth/id-token-revoked') {
                return next((0, errors_1.createHttpError)(401, 'TOKEN_REVOKED', 'Session has been revoked.'));
            }
            if (code === 'auth/id-token-expired') {
                return next((0, errors_1.createHttpError)(401, 'TOKEN_EXPIRED', 'Token has expired.'));
            }
            return next((0, errors_1.createHttpError)(401, 'INVALID_TOKEN', 'Token could not be verified.'));
        }
    };
}
// ── authorize ────────────────────────────────────────────────────────────────
function authorize(...roles) {
    return (req, _res, next) => {
        const principal = req.principal;
        if (!principal) {
            return next((0, errors_1.createHttpError)(401, 'UNAUTHENTICATED', 'Authentication required.'));
        }
        // super_admin inherits all admin permissions
        const effectiveRoles = principal.role === 'super_admin' ? ['super_admin', 'admin'] : [principal.role];
        const allowed = roles.some(r => effectiveRoles.includes(r));
        if (!allowed) {
            return next((0, errors_1.createHttpError)(403, 'FORBIDDEN', `Role '${principal.role}' is not permitted to perform this action.`));
        }
        next();
    };
}
// ── mustBeOwnerOrAdmin ───────────────────────────────────────────────────────
function mustBeOwnerOrAdmin(getResourceUid) {
    return (req, _res, next) => {
        const principal = req.principal;
        const resourceUid = getResourceUid(req);
        if (!resourceUid)
            return next();
        const isOwner = principal.uid === resourceUid;
        const isAdmin = principal.role === 'admin' || principal.role === 'super_admin';
        if (!isOwner && !isAdmin) {
            return next((0, errors_1.createHttpError)(403, 'FORBIDDEN', 'You do not have access to this resource.'));
        }
        next();
    };
}
//# sourceMappingURL=index.js.map