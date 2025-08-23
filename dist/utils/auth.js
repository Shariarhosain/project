"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUserToken = exports.extractGuestToken = exports.verifyJWT = exports.generateJWT = exports.generateGuestToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const generateGuestToken = () => {
    return (0, uuid_1.v4)();
};
exports.generateGuestToken = generateGuestToken;
const generateJWT = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateJWT = generateJWT;
const verifyJWT = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyJWT = verifyJWT;
const extractGuestToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};
exports.extractGuestToken = extractGuestToken;
const extractUserToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};
exports.extractUserToken = extractUserToken;
//# sourceMappingURL=auth.js.map