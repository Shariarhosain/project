import { AddToCartInput, UpdateCartItemInput } from '../schemas/validation';
export declare class CartService {
    transferGuestCartToUser(guestToken: string, userId: string): Promise<({
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                category: string;
                status: import(".prisma/client").$Enums.ProductStatus;
                description: string | null;
                images: string[];
            };
            variant: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string;
                price: number;
                inventory: number;
                attributes: import("@prisma/client/runtime/library").JsonValue | null;
                productId: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        promoCode: string | null;
        guestToken: string | null;
        userId: string | null;
        promoId: string | null;
        discount: number;
        expiresAt: Date;
    }) | null>;
    getOrCreateCart(guestToken?: string, userId?: string): Promise<{
        finalSubtotal: number;
        discountApplied: boolean;
        itemCount: number;
        subtotal: number;
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                category: string;
                status: import(".prisma/client").$Enums.ProductStatus;
                description: string | null;
                images: string[];
            };
            variant: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string;
                price: number;
                inventory: number;
                attributes: import("@prisma/client/runtime/library").JsonValue | null;
                productId: string;
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
    }>;
    getCart(guestToken: string): Promise<{
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
    }>;
    addToCart(guestTokenOrUserId: string | undefined, data: AddToCartInput, userId?: string): Promise<{
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
    }>;
    updateCartItem(guestToken: string, itemId: string, data: UpdateCartItemInput): Promise<{
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
    }>;
    removeCartItem(guestToken: string, itemId: string): Promise<{
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
    }>;
    clearCart(guestToken: string): Promise<{
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
    }>;
    private calculateCartTotals;
    applyPromoToCart(guestToken?: string, userId?: string, promoId?: string, promoCode?: string, discount?: number): Promise<{
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
    }>;
    removePromoFromCart(guestToken?: string, userId?: string): Promise<{
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
    }>;
    getUserCart(userId: string): Promise<{
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
    }>;
}
declare const _default: CartService;
export default _default;
//# sourceMappingURL=cartService.d.ts.map