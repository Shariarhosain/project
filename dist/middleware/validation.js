"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = result.body || req.body;
            req.query = result.query || req.query;
            req.params = result.params || req.params;
            next();
        }
        catch (error) {
            const errorMessage = error.errors?.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation error';
            next((0, errorHandler_1.createError)(errorMessage, 400));
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.js.map