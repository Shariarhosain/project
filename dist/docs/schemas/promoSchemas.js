"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promoSchemas = void 0;
exports.promoSchemas = {
    Promo: {
        type: 'object',
        required: ['id', 'code', 'name', 'type', 'value', 'status'],
        properties: {
            id: {
                type: 'string',
                description: 'Unique promo identifier',
                example: '64f5e8b12345abcd67890128'
            },
            code: {
                type: 'string',
                description: 'Promo code to apply',
                example: 'WELCOME10'
            },
            name: {
                type: 'string',
                description: 'Promo display name',
                example: 'Welcome Discount'
            },
            description: {
                type: 'string',
                description: 'Promo description',
                example: '10% off your first order'
            },
            type: {
                type: 'string',
                enum: ['PERCENTAGE', 'FIXED'],
                description: 'Discount type',
                example: 'PERCENTAGE'
            },
            value: {
                type: 'number',
                format: 'float',
                description: 'Discount value (percentage or fixed amount)',
                example: 10
            },
            minAmount: {
                type: 'number',
                format: 'float',
                description: 'Minimum order amount required',
                example: 50
            },
            maxDiscount: {
                type: 'number',
                format: 'float',
                description: 'Maximum discount amount (for percentage promos)',
                example: 20
            },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
                example: 'ACTIVE'
            },
            validFrom: {
                type: 'string',
                format: 'date-time',
                description: 'Promo valid from date',
                example: '2024-01-01T00:00:00.000Z'
            },
            validTo: {
                type: 'string',
                format: 'date-time',
                description: 'Promo valid until date',
                example: '2024-12-31T23:59:59.000Z'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-01T00:00:00.000Z'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-01T00:00:00.000Z'
            }
        }
    },
    CreatePromoRequest: {
        type: 'object',
        required: ['code', 'name', 'type', 'value'],
        properties: {
            code: {
                type: 'string',
                minLength: 3,
                maxLength: 20,
                pattern: '^[A-Z0-9]+$',
                description: 'Promo code (uppercase letters and numbers only)',
                example: 'WELCOME10'
            },
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Promo display name',
                example: 'Welcome Discount'
            },
            description: {
                type: 'string',
                maxLength: 500,
                description: 'Promo description',
                example: '10% off your first order'
            },
            type: {
                type: 'string',
                enum: ['PERCENTAGE', 'FIXED'],
                description: 'Discount type',
                example: 'PERCENTAGE'
            },
            value: {
                type: 'number',
                format: 'float',
                minimum: 0,
                description: 'Discount value (0-100 for percentage, any positive for fixed)',
                example: 10
            },
            minAmount: {
                type: 'number',
                format: 'float',
                minimum: 0,
                description: 'Minimum order amount required',
                example: 50
            },
            maxDiscount: {
                type: 'number',
                format: 'float',
                minimum: 0,
                description: 'Maximum discount amount (for percentage promos)',
                example: 20
            },
            validFrom: {
                type: 'string',
                format: 'date-time',
                description: 'Promo valid from date',
                example: '2024-01-01T00:00:00.000Z'
            },
            validTo: {
                type: 'string',
                format: 'date-time',
                description: 'Promo valid until date',
                example: '2024-12-31T23:59:59.000Z'
            }
        }
    },
    ApplyPromoRequest: {
        type: 'object',
        required: ['promoCode'],
        properties: {
            promoCode: {
                type: 'string',
                description: 'Promo code to apply',
                example: 'WELCOME10'
            }
        }
    },
    PromoApplicationResult: {
        type: 'object',
        properties: {
            valid: {
                type: 'boolean',
                description: 'Whether the promo is valid',
                example: true
            },
            promo: {
                $ref: '#/components/schemas/Promo'
            },
            discount: {
                type: 'number',
                format: 'float',
                description: 'Calculated discount amount',
                example: 5.99
            },
            message: {
                type: 'string',
                description: 'Result message',
                example: 'Promo applied successfully'
            },
            error: {
                type: 'string',
                description: 'Error message if invalid',
                example: 'Promo code has expired'
            }
        }
    },
    PromoList: {
        type: 'object',
        required: ['promos', 'pagination'],
        properties: {
            promos: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/Promo'
                }
            },
            pagination: {
                $ref: '#/components/schemas/Pagination'
            }
        }
    }
};
//# sourceMappingURL=promoSchemas.js.map