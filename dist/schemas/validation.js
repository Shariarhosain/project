"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productQuerySchema = exports.paginationSchema = exports.createOrderSchema = exports.applyPromoSchema = exports.createPromoSchema = exports.updateCartItemSchema = exports.addToCartSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        description: zod_1.z.string().optional(),
        slug: zod_1.z.string().min(1, 'Slug is required'),
        images: zod_1.z.array(zod_1.z.string().url()).optional().default([]),
        category: zod_1.z.string().min(1, 'Category is required'),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional().default('ACTIVE'),
        variants: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string().min(1, 'Variant name is required'),
            sku: zod_1.z.string().min(1, 'SKU is required'),
            price: zod_1.z.number().positive('Price must be positive'),
            inventory: zod_1.z.number().int().min(0, 'Inventory must be non-negative').default(0),
            attributes: zod_1.z.record(zod_1.z.any()).optional(),
        })).min(1, 'At least one variant is required'),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().optional(),
        slug: zod_1.z.string().min(1).optional(),
        images: zod_1.z.array(zod_1.z.string().url()).optional(),
        category: zod_1.z.string().min(1).optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
    }),
});
exports.addToCartSchema = zod_1.z.object({
    body: zod_1.z.object({
        variantId: zod_1.z.string().min(1, 'Variant ID is required'),
        quantity: zod_1.z.number().int().positive('Quantity must be positive').default(1),
    }),
});
exports.updateCartItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        quantity: zod_1.z.number().int().positive('Quantity must be positive'),
    }),
});
exports.createPromoSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string().min(1, 'Promo code is required'),
        name: zod_1.z.string().min(1, 'Promo name is required'),
        description: zod_1.z.string().optional(),
        type: zod_1.z.enum(['PERCENTAGE', 'FIXED']),
        value: zod_1.z.number().positive('Value must be positive'),
        minAmount: zod_1.z.number().positive().optional(),
        maxDiscount: zod_1.z.number().positive().optional(),
        usageLimit: zod_1.z.number().int().positive().optional(),
        validFrom: zod_1.z.string().datetime(),
        validTo: zod_1.z.string().datetime(),
    }),
});
exports.applyPromoSchema = zod_1.z.object({
    body: zod_1.z.object({
        promoCode: zod_1.z.string().min(1, 'Promo code is required'),
    }),
});
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerInfo: zod_1.z.object({
            name: zod_1.z.string().min(1, 'Name is required'),
            email: zod_1.z.string().email('Valid email is required'),
            phone: zod_1.z.string().optional(),
            address: zod_1.z.object({
                street: zod_1.z.string().min(1, 'Street is required'),
                city: zod_1.z.string().min(1, 'City is required'),
                state: zod_1.z.string().min(1, 'State is required'),
                zipCode: zod_1.z.string().min(1, 'Zip code is required'),
                country: zod_1.z.string().min(1, 'Country is required'),
            }),
        }),
        promoCode: zod_1.z.string().optional(),
    }),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 10),
});
exports.productQuerySchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
    search: zod_1.z.string().optional(),
}).merge(exports.paginationSchema);
//# sourceMappingURL=validation.js.map