import { AddToCartInput, UpdateCartItemInput } from '../schemas/validation';
export declare class CartService {
    getOrCreateCart(guestToken?: string, userId?: string): Promise<{
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
        guestToken: string | null;
        userId: string | null;
        expiresAt: Date;
    }>;
    getCart(guestToken: string): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guestToken: string | null;
        userId: string | null;
        expiresAt: Date;
    }>;
    addToCart(guestToken: string, data: AddToCartInput): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guestToken: string | null;
        userId: string | null;
        expiresAt: Date;
    }>;
    updateCartItem(guestToken: string, itemId: string, data: UpdateCartItemInput): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guestToken: string | null;
        userId: string | null;
        expiresAt: Date;
    }>;
    removeCartItem(guestToken: string, itemId: string): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guestToken: string | null;
        userId: string | null;
        expiresAt: Date;
    }>;
    clearCart(guestToken: string): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        guestToken: string | null;
        userId: string | null;
        expiresAt: Date;
    }>;
    private calculateCartTotals;
}
declare const _default: CartService;
export default _default;
//# sourceMappingURL=cartService.d.ts.map