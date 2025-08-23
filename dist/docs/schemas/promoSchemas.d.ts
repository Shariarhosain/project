export declare const promoSchemas: {
    Promo: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
                description: string;
                example: string;
            };
            code: {
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
            type: {
                type: string;
                enum: string[];
                description: string;
                example: string;
            };
            value: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            minAmount: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            maxDiscount: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            status: {
                type: string;
                enum: string[];
                example: string;
            };
            validFrom: {
                type: string;
                format: string;
                description: string;
                example: string;
            };
            validTo: {
                type: string;
                format: string;
                description: string;
                example: string;
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
    CreatePromoRequest: {
        type: string;
        required: string[];
        properties: {
            code: {
                type: string;
                minLength: number;
                maxLength: number;
                pattern: string;
                description: string;
                example: string;
            };
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
            type: {
                type: string;
                enum: string[];
                description: string;
                example: string;
            };
            value: {
                type: string;
                format: string;
                minimum: number;
                description: string;
                example: number;
            };
            minAmount: {
                type: string;
                format: string;
                minimum: number;
                description: string;
                example: number;
            };
            maxDiscount: {
                type: string;
                format: string;
                minimum: number;
                description: string;
                example: number;
            };
            validFrom: {
                type: string;
                format: string;
                description: string;
                example: string;
            };
            validTo: {
                type: string;
                format: string;
                description: string;
                example: string;
            };
        };
    };
    ApplyPromoRequest: {
        type: string;
        required: string[];
        properties: {
            promoCode: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
    PromoApplicationResult: {
        type: string;
        properties: {
            valid: {
                type: string;
                description: string;
                example: boolean;
            };
            promo: {
                $ref: string;
            };
            discount: {
                type: string;
                format: string;
                description: string;
                example: number;
            };
            message: {
                type: string;
                description: string;
                example: string;
            };
            error: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
    PromoList: {
        type: string;
        required: string[];
        properties: {
            promos: {
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
//# sourceMappingURL=promoSchemas.d.ts.map