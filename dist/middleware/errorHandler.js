"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.createError = void 0;
const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const errorHandler = (err, req, res, next) => {
    const { statusCode = 500, message } = err;
    console.error('Error:', {
        statusCode,
        message,
        stack: err.stack,
        url: req.url,
        method: req.method,
    });
    res.status(statusCode).json({
        error: {
            message: statusCode === 500 ? 'Internal server error' : message,
            status: statusCode,
            timestamp: new Date().toISOString(),
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map