export declare const productSchemas: {
    Product: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            description: {
                type: string;
                description: string;
                example: string;
            };
            slug: {
                type: string;
                description: string;
                example: string;
            };
            category: {
                type: string;
                description: string;
                example: string;
            };
            images: {
                type: string;
                items: {
                    type: string;
                    format: string;
                };
                description: string;
                example: string[];
            };
            status: {
                type: string;
                enum: string[];
                example: string;
            };
            variants: {
                type: string;
                items: {
                    $ref: string;
                };
            };
            createdAt: {
                type: string;
                format: string;
                example: string;
            };
            updatedAt: {
                type: string;
                format: string;
                example: string;
            };
        };
    };
    ProductVariant: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            sku: {
                type: string;
                description: string;
                example: string;
            };
            price: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            inventory: {
                type: string;
                description: string;
                example: number;
            };
            attributes: {
                type: string;
                description: string;
                example: {
                    size: string;
                    color: string;
                };
            };
        };
    };
    CreateProductRequest: {
        type: string;
        required: string[];
        properties: {
            name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
                example: string;
            };
            description: {
                type: string;
                maxLength: number;
                description: string;
                example: string;
            };
            category: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
                example: string;
            };
            images: {
                type: string;
                items: {
                    type: string;
                    format: string;
                };
                description: string;
                example: string[];
            };
            status: {
                type: string;
                enum: string[];
                description: string;
                example: string;
            };
            variants: {
                type: string;
                minItems: number;
                items: {
                    $ref: string;
                };
            };
        };
    };
    CreateVariantRequest: {
        type: string;
        required: string[];
        properties: {
            name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
                example: string;
            };
            sku: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
                example: string;
            };
            price: {
                type: string;
                format: string;
                minimum: number;
                description: string;
                example: number;
            };
            inventory: {
                type: string;
                minimum: number;
                description: string;
                example: number;
            };
            attributes: {
                type: string;
                description: string;
                example: {
                    size: string;
                    color: string;
                };
            };
        };
    };
    ProductList: {
        type: string;
        required: string[];
        properties: {
            products: {
                type: string;
                items: {
                    $ref: string;
                };
            };
            pagination: {
                $ref: string;
            };
        };
    };
};
//# sourceMappingURL=productSchemas.d.ts.map