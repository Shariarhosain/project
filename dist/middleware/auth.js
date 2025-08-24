"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureGuestToken = exports.guestOrAuth = exports.optionalAuth = exports.requireUser = exports.requireAdmin = exports.authenticateToken = void 0;
const auth_1 = require("../utils/auth");
const errorHandler_1 = require("./errorHandler");
const isGuestToken = (token) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
};
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next((0, errorHandler_1.createError)('Access token required', 401));
    }
    const token = authHeader.substring(7);
    try {
        const decoded = (0, auth_1.verifyJWT)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return next((0, errorHandler_1.createError)('Invalid or expired token', 401));
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return next((0, errorHandler_1.createError)('Authentication required', 401));
    }
    if (req.user.role !== 'admin') {
        return next((0, errorHandler_1.createError)('Admin access required', 403));
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireUser = (req, res, next) => {
    if (!req.user) {
        return next((0, errorHandler_1.createError)('Authentication required', 401));
    }
    if (!['admin', 'user'].includes(req.user.role)) {
        return next((0, errorHandler_1.createError)('User access required', 403));
    }
    next();
};
exports.requireUser = requireUser;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = (0, auth_1.verifyJWT)(token);
            req.user = decoded;
        }
        catch (error) {
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
const guestOrAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (isGuestToken(token)) {
            req.guestToken = token;
            req.isGuest = true;
            return next();
        }
        try {
            const decoded = (0, auth_1.verifyJWT)(token);
            req.user = decoded;
            return next();
        }
        catch (error) {
        }
    }
    req.isGuest = true;
    next();
};
exports.guestOrAuth = guestOrAuth;
const ensureGuestToken = (req, res, next) => {
    if (req.user) {
        return next();
    }
    if (!req.guestToken) {
        req.guestToken = (0, auth_1.generateGuestToken)();
        res.setHeader('X-Guest-Token', req.guestToken);
    }
    next();
};
exports.ensureGuestToken = ensureGuestToken;
//# sourceMappingURL=auth.js.map