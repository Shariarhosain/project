import { CreatePromoInput } from '../schemas/validation';
export declare class PromoService {
    createPromo(data: CreatePromoInput): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromoStatus;
        code: string;
        type: import(".prisma/client").$Enums.PromoType;
        value: number;
        description: string | null;
        minAmount: number | null;
        maxDiscount: number | null;
        usageLimit: number | null;
        validFrom: Date;
        validTo: Date;
        usageCount: number;
    }>;
    getPromos(page?: number, limit?: number, isAdmin?: boolean): Promise<{
        promos: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PromoStatus;
            code: string;
            type: import(".prisma/client").$Enums.PromoType;
            value: number;
            description: string | null;
            minAmount: number | null;
            maxDiscount: number | null;
            usageLimit: number | null;
            validFrom: Date;
            validTo: Date;
            usageCount: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPromoById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromoStatus;
        code: string;
        type: import(".prisma/client").$Enums.PromoType;
        value: number;
        description: string | null;
        minAmount: number | null;
        maxDiscount: number | null;
        usageLimit: number | null;
        validFrom: Date;
        validTo: Date;
        usageCount: number;
    }>;
    validatePromo(code: string, cartSubtotal: number): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromoStatus;
        code: string;
        type: import(".prisma/client").$Enums.PromoType;
        value: number;
        description: string | null;
        minAmount: number | null;
        maxDiscount: number | null;
        usageLimit: number | null;
        validFrom: Date;
        validTo: Date;
        usageCount: number;
    }>;
    calculateDiscount(promo: any, cartSubtotal: number): Promise<number>;
    applyPromoToCart(guestToken?: string, promoCode?: string, userId?: string): Promise<{
        message: string;
        promo: {
            id: string;
            code: string;
            name: string;
            description: string | null;
            type: import(".prisma/client").$Enums.PromoType;
            value: number;
        };
        discount: {
            amount: number;
            originalSubtotal: number;
            finalSubtotal: number;
        };
        cart: {
            finalSubtotal: number;
            discountApplied: boolean;
            itemCount: number;
            subtotal: number;
            items: ({
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    status: import(".prisma/client").$Enums.ProductStatus;
                    images: string[];
                };
                variant: {
                    id: string;
                    name: string;
                    sku: string;
                    price: number;
                    inventory: number;
                    attributes: import("@prisma/client/runtime/library").JsonValue;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                variantId: string;
                productId: string;
                cartId: string;
            })[];
            promo: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PromoStatus;
                code: string;
                type: import(".prisma/client").$Enums.PromoType;
                value: number;
                description: string | null;
                minAmount: number | null;
                maxDiscount: number | null;
                usageLimit: number | null;
                validFrom: Date;
                validTo: Date;
                usageCount: number;
            } | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            promoCode: string | null;
            guestToken: string | null;
            userId: string | null;
            promoId: string | null;
            discount: number;
            expiresAt: Date;
        };
    }>;
    removePromoFromCart(guestToken?: string, userId?: string): Promise<{
        message: string;
        cart: {
            finalSubtotal: number;
            discountApplied: boolean;
            itemCount: number;
            subtotal: number;
            items: ({
                product: {
                    id: string;
                    name: string;
                    slug: string;
                    status: import(".prisma/client").$Enums.ProductStatus;
                    images: string[];
                };
                variant: {
                    id: string;
                    name: string;
                    sku: string;
                    price: number;
                    inventory: number;
                    attributes: import("@prisma/client/runtime/library").JsonValue;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                variantId: string;
                productId: string;
                cartId: string;
            })[];
            promo: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PromoStatus;
                code: string;
                type: import(".prisma/client").$Enums.PromoType;
                value: number;
                description: string | null;
                minAmount: number | null;
                maxDiscount: number | null;
                usageLimit: number | null;
                validFrom: Date;
                validTo: Date;
                usageCount: number;
            } | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            promoCode: string | null;
            guestToken: string | null;
            userId: string | null;
            promoId: string | null;
            discount: number;
            expiresAt: Date;
        };
    }>;
    updatePromo(id: string, data: Partial<CreatePromoInput>): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromoStatus;
        code: string;
        type: import(".prisma/client").$Enums.PromoType;
        value: number;
        description: string | null;
        minAmount: number | null;
        maxDiscount: number | null;
        usageLimit: number | null;
        validFrom: Date;
        validTo: Date;
        usageCount: number;
    }>;
    deletePromo(id: string): Promise<void>;
    incrementPromoUsage(promoId: string): Promise<void>;
}
declare const _default: PromoService;
export default _default;
//# sourceMappingURL=promoService.d.ts.map