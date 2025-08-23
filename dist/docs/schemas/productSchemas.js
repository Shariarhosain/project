"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSchemas = void 0;
exports.productSchemas = {
    Product: {
        type: 'object',
        required: ['id', 'name', 'slug', 'category', 'status'],
        properties: {
            id: {
                type: 'string',
                description: 'Unique product identifier',
                example: '64f5e8b12345abcd67890124'
            },
            name: {
                type: 'string',
                description: 'Product name',
                example: 'Classic T-Shirt'
            },
            description: {
                type: 'string',
                description: 'Product description',
                example: 'A comfortable cotton t-shirt'
            },
            slug: {
                type: 'string',
                description: 'URL-friendly product identifier',
                example: 'classic-t-shirt'
            },
            category: {
                type: 'string',
                description: 'Product category',
                example: 'Clothing'
            },
            images: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'uri'
                },
                description: 'Product image URLs',
                example: ['https://example.com/image1.jpg']
            },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE'],
                example: 'ACTIVE'
            },
            variants: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ProductVariant'
                }
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
    ProductVariant: {
        type: 'object',
        required: ['id', 'name', 'sku', 'price', 'inventory'],
        properties: {
            id: {
                type: 'string',
                example: '64f5e8b12345abcd67890125'
            },
            name: {
                type: 'string',
                description: 'Variant name (size, color, etc.)',
                example: 'Medium - Black'
            },
            sku: {
                type: 'string',
                description: 'Stock keeping unit',
                example: 'TSH-BLK-M'
            },
            price: {
                type: 'number',
                format: 'float',
                description: 'Variant price',
                example: 19.99
            },
            inventory: {
                type: 'integer',
                description: 'Available stock',
                example: 75
            },
            attributes: {
                type: 'object',
                description: 'Variant attributes',
                example: { size: 'M', color: 'Black' }
            }
        }
    },
    CreateProductRequest: {
        type: 'object',
        required: ['name', 'category', 'variants'],
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 200,
                description: 'Product name',
                example: 'Classic T-Shirt'
            },
            description: {
                type: 'string',
                maxLength: 1000,
                description: 'Product description',
                example: 'A comfortable cotton t-shirt'
            },
            category: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Product category',
                example: 'Clothing'
            },
            images: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'uri'
                },
                description: 'Product image URLs',
                example: ['https://example.com/image1.jpg']
            },
            status: {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE'],
                description: 'Product status (defaults to ACTIVE)',
                example: 'ACTIVE'
            },
            variants: {
                type: 'array',
                minItems: 1,
                items: {
                    $ref: '#/components/schemas/CreateVariantRequest'
                }
            }
        }
    },
    CreateVariantRequest: {
        type: 'object',
        required: ['name', 'sku', 'price', 'inventory'],
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Variant name',
                example: 'Medium - Black'
            },
            sku: {
                type: 'string',
                minLength: 1,
                maxLength: 50,
                description: 'Stock keeping unit',
                example: 'TSH-BLK-M'
            },
            price: {
                type: 'number',
                format: 'float',
                minimum: 0,
                description: 'Variant price',
                example: 19.99
            },
            inventory: {
                type: 'integer',
                minimum: 0,
                description: 'Available stock',
                example: 75
            },
            attributes: {
                type: 'object',
                description: 'Variant attributes (size, color, etc.)',
                example: { size: 'M', color: 'Black' }
            }
        }
    },
    ProductList: {
        type: 'object',
        required: ['products', 'pagination'],
        properties: {
            products: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/Product'
                }
            },
            pagination: {
                $ref: '#/components/schemas/Pagination'
            }
        }
    }
};
//# sourceMappingURL=productSchemas.js.map