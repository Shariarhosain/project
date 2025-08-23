"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireUser = exports.requireAdmin = exports.authenticateToken = void 0;
const auth_1 = require("../utils/auth");
const errorHandler_1 = require("./errorHandler");
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
//# sourceMappingURL=auth.js.map