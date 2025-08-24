import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        slug: z.ZodString;
        images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        category: z.ZodString;
        status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "DISCONTINUED"]>>>;
        variants: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            sku: z.ZodString;
            price: z.ZodNumber;
            inventory: z.ZodDefault<z.ZodNumber>;
            attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            sku: string;
            price: number;
            inventory: number;
            attributes?: Record<string, any> | undefined;
        }, {
            name: string;
            sku: string;
            price: number;
            inventory?: number | undefined;
            attributes?: Record<string, any> | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        slug: string;
        category: string;
        status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
        variants: {
            name: string;
            sku: string;
            price: number;
            inventory: number;
            attributes?: Record<string, any> | undefined;
        }[];
        images: string[];
        description?: string | undefined;
    }, {
        name: string;
        slug: string;
        category: string;
        variants: {
            name: string;
            sku: string;
            price: number;
            inventory?: number | undefined;
            attributes?: Record<string, any> | undefined;
        }[];
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        description?: string | undefined;
        images?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        slug: string;
        category: string;
        status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
        variants: {
            name: string;
            sku: string;
            price: number;
            inventory: number;
            attributes?: Record<string, any> | undefined;
        }[];
        images: string[];
        description?: string | undefined;
    };
}, {
    body: {
        name: string;
        slug: string;
        category: string;
        variants: {
            name: string;
            sku: string;
            price: number;
            inventory?: number | undefined;
            attributes?: Record<string, any> | undefined;
        }[];
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        description?: string | undefined;
        images?: string[] | undefined;
    };
}>;
export declare const updateProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        category: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "DISCONTINUED"]>>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        slug?: string | undefined;
        category?: string | undefined;
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        description?: string | undefined;
        images?: string[] | undefined;
    }, {
        name?: string | undefined;
        slug?: string | undefined;
        category?: string | undefined;
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        description?: string | undefined;
        images?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        slug?: string | undefined;
        category?: string | undefined;
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        description?: string | undefined;
        images?: string[] | undefined;
    };
}, {
    body: {
        name?: string | undefined;
        slug?: string | undefined;
        category?: string | undefined;
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        description?: string | undefined;
        images?: string[] | undefined;
    };
}>;
export declare const addToCartSchema: z.ZodObject<{
    body: z.ZodObject<{
        variantId: z.ZodString;
        quantity: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        variantId: string;
    }, {
        variantId: string;
        quantity?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        quantity: number;
        variantId: string;
    };
}, {
    body: {
        variantId: string;
        quantity?: number | undefined;
    };
}>;
export declare const updateCartItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
    }, {
        quantity: number;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        quantity: number;
    };
}, {
    body: {
        quantity: number;
    };
}>;
export declare const createPromoSchema: z.ZodObject<{
    body: z.ZodObject<{
        code: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["PERCENTAGE", "FIXED"]>;
        value: z.ZodNumber;
        minAmount: z.ZodOptional<z.ZodNumber>;
        maxDiscount: z.ZodOptional<z.ZodNumber>;
        usageLimit: z.ZodOptional<z.ZodNumber>;
        validFrom: z.ZodString;
        validTo: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        code: string;
        type: "PERCENTAGE" | "FIXED";
        value: number;
        validFrom: string;
        validTo: string;
        description?: string | undefined;
        minAmount?: number | undefined;
        maxDiscount?: number | undefined;
        usageLimit?: number | undefined;
    }, {
        name: string;
        code: string;
        type: "PERCENTAGE" | "FIXED";
        value: number;
        validFrom: string;
        validTo: string;
        description?: string | undefined;
        minAmount?: number | undefined;
        maxDiscount?: number | undefined;
        usageLimit?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        code: string;
        type: "PERCENTAGE" | "FIXED";
        value: number;
        validFrom: string;
        validTo: string;
        description?: string | undefined;
        minAmount?: number | undefined;
        maxDiscount?: number | undefined;
        usageLimit?: number | undefined;
    };
}, {
    body: {
        name: string;
        code: string;
        type: "PERCENTAGE" | "FIXED";
        value: number;
        validFrom: string;
        validTo: string;
        description?: string | undefined;
        minAmount?: number | undefined;
        maxDiscount?: number | undefined;
        usageLimit?: number | undefined;
    };
}>;
export declare const applyPromoSchema: z.ZodObject<{
    body: z.ZodObject<{
        promoCode: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        promoCode: string;
    }, {
        promoCode: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        promoCode: string;
    };
}, {
    body: {
        promoCode: string;
    };
}>;
export declare const createOrderSchema: z.ZodObject<{
    body: z.ZodEffects<z.ZodObject<{
        customerInfo: z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            address: z.ZodObject<{
                street: z.ZodString;
                city: z.ZodString;
                state: z.ZodString;
                zipCode: z.ZodString;
                country: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            }, {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            name: string;
            address: {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            };
            phone?: string | undefined;
        }, {
            email: string;
            name: string;
            address: {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            };
            phone?: string | undefined;
        }>;
        paymentInfo: z.ZodOptional<z.ZodObject<{
            method: z.ZodEnum<["credit_card", "debit_card", "paypal", "stripe", "apple_pay", "google_pay", "bank_transfer", "cash_on_delivery"]>;
            transactionId: z.ZodString;
            cardLastFour: z.ZodOptional<z.ZodString>;
            cardBrand: z.ZodOptional<z.ZodString>;
            paymentGateway: z.ZodOptional<z.ZodString>;
            gatewayResponse: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            method: "credit_card" | "debit_card" | "paypal" | "stripe" | "apple_pay" | "google_pay" | "bank_transfer" | "cash_on_delivery";
            transactionId: string;
            cardLastFour?: string | undefined;
            cardBrand?: string | undefined;
            paymentGateway?: string | undefined;
            gatewayResponse?: Record<string, any> | undefined;
        }, {
            method: "credit_card" | "debit_card" | "paypal" | "stripe" | "apple_pay" | "google_pay" | "bank_transfer" | "cash_on_delivery";
            transactionId: string;
            cardLastFour?: string | undefined;
            cardBrand?: string | undefined;
            paymentGateway?: string | undefined;
            gatewayResponse?: Record<string, any> | undefined;
        }>>;
        promoCode: z.ZodOptional<z.ZodString>;
        createAccount: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        password: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        customerInfo: {
            email: string;
            name: string;
            address: {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            };
            phone?: string | undefined;
        };
        createAccount: boolean;
        password?: string | undefined;
        promoCode?: string | undefined;
        paymentInfo?: {
            method: "credit_card" | "debit_card" | "paypal" | "stripe" | "apple_pay" | "google_pay" | "bank_transfer" | "cash_on_delivery";
            transactionId: string;
            cardLastFour?: string | undefined;
            cardBrand?: string | undefined;
            paymentGateway?: string | undefined;
            gatewayResponse?: Record<string, any> | undefined;
        } | undefined;
    }, {
        customerInfo: {
            email: string;
            name: string;
            address: {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            };
            phone?: string | undefined;
        };
        password?: string | undefined;
        promoCode?: string | undefined;
        paymentInfo?: {
            method: "credit_card" | "debit_card" | "paypal" | "stripe" | "apple_pay" | "google_pay" | "bank_transfer" | "cash_on_delivery";
            transactionId: string;
            cardLastFour?: string | undefined;
            cardBrand?: string | undefined;
            paymentGateway?: string | undefined;
            gatewayResponse?: Record<string, any> | undefined;
        } | undefined;
        createAccount?: boolean | undefined;
    }>, {
        customerInfo: {
            email: string;
            name: string;
            address: {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            };
            phone?: string | undefined;
        };
        createAccount: boolean;
        password?: string | undefined;
        promoCode?: string | undefined;
        paymentInfo?: {
            method: "credit_card" | "debit_card" | "paypal" | "stripe" | "apple_pay" | "google_pay" | "bank_transfer" | "cash_on_delivery";
            transactionId: string;
            cardLastFour?: string | undefined;
            cardBrand?: string | undefined;
            paymentGateway?: string | undefined;
            gatewayResponse?: Record<string, any> | undefined;
        } | undefined;
    }, {
        customerInfo: {
            email: string;
            name: string;
            address: {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            };
            phone?: string | undefined;
        };
        password?: string | undefined;
        promoCode?: string | undefined;
        paymentInfo?: {
            method: "credit_card" | "debit_card" | "paypal" | "stripe" | "apple_pay" | "google_pay" | "bank_transfer" | "cash_on_delivery";
            transactionId: string;
            cardLastFour?: string | undefined;
            cardBrand?: string | undefined;
            paymentGateway?: string | undefined;
            gatewayResponse?: Record<string, any> | undefined;
        } | undefined;
        createAccount?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        customerInfo: {
            email: string;
            name: string;
            address: {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            };
            phone?: string | undefined;
        };
        createAccount: boolean;
        password?: string | undefined;
        promoCode?: string | undefined;
        paymentInfo?: {
            method: "credit_card" | "debit_card" | "paypal" | "stripe" | "apple_pay" | "google_pay" | "bank_transfer" | "cash_on_delivery";
            transactionId: string;
            cardLastFour?: string | undefined;
            cardBrand?: string | undefined;
            paymentGateway?: string | undefined;
            gatewayResponse?: Record<string, any> | undefined;
        } | undefined;
    };
}, {
    body: {
        customerInfo: {
            email: string;
            name: string;
            address: {
                street: string;
                city: string;
                country: string;
                state: string;
                zipCode: string;
            };
            phone?: string | undefined;
        };
        password?: string | undefined;
        promoCode?: string | undefined;
        paymentInfo?: {
            method: "credit_card" | "debit_card" | "paypal" | "stripe" | "apple_pay" | "google_pay" | "bank_transfer" | "cash_on_delivery";
            transactionId: string;
            cardLastFour?: string | undefined;
            cardBrand?: string | undefined;
            paymentGateway?: string | undefined;
            gatewayResponse?: Record<string, any> | undefined;
        } | undefined;
        createAccount?: boolean | undefined;
    };
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: string | undefined;
    limit?: string | undefined;
}>;
export declare const productQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        category: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "DISCONTINUED"]>>;
        search: z.ZodOptional<z.ZodString>;
    } & {
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        category?: string | undefined;
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        search?: string | undefined;
    }, {
        category?: string | undefined;
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        search?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        category?: string | undefined;
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        search?: string | undefined;
    };
}, {
    query: {
        category?: string | undefined;
        status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED" | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        search?: string | undefined;
    };
}>;
export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];
export type CreatePromoInput = z.infer<typeof createPromoSchema>['body'];
export type ApplyPromoInput = z.infer<typeof applyPromoSchema>['body'];
export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type ProductQueryInput = z.infer<typeof productQuerySchema>['query'];
//# sourceMappingURL=validation.d.ts.map