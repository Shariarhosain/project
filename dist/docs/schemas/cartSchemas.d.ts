export declare const cartSchemas: {
    Cart: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
                description: string;
                example: string;
            };
            userId: {
                type: string;
                description: string;
                example: string;
            };
            guestToken: {
                type: string;
                description: string;
                example: string;
            };
            items: {
                type: string;
                items: {
                    $ref: string;
                };
            };
            itemCount: {
                type: string;
                description: string;
                example: number;
            };
            subtotal: {
                type: string;
                format: string;
                description: string;
                example: number;
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
    CartItem: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
                example: string;
            };
            quantity: {
                type: string;
                minimum: number;
                example: number;
            };
            product: {
                $ref: string;
            };
            variant: {
                $ref: string;
            };
            subtotal: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
        };
    };
    AddToCartRequest: {
        type: string;
        required: string[];
        properties: {
            variantId: {
                type: string;
                description: string;
                example: string;
            };
            quantity: {
                type: string;
                minimum: number;
                maximum: number;
                description: string;
                example: number;
            };
        };
    };
    UpdateCartItemRequest: {
        type: string;
        required: string[];
        properties: {
            quantity: {
                type: string;
                minimum: number;
                maximum: number;
                description: string;
                example: number;
            };
        };
    };
    CartResponse: {
        type: string;
        properties: {
            message: {
                type: string;
                example: string;
            };
            cart: {
                $ref: string;
            };
            guestToken: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
};
//# sourceMappingURL=cartSchemas.d.ts.map