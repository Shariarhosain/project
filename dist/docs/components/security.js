"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securitySchemes = void 0;
exports.securitySchemes = {
    BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login endpoint. Format: Bearer <token>'
    },
    GuestToken: {
        type: 'http',
        scheme: 'bearer',
        description: 'Auto-generated UUID token for guest users. No registration required.'
    }
};
//# sourceMappingURL=security.js.map