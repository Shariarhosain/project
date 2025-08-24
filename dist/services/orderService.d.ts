import { CreateOrderInput } from '../schemas/validation';
export declare class OrderService {
    createOrderForGuestOrUser(guestTokenOrUserId: string, data: CreateOrderInput, isUser?: boolean): Promise<{
        user?: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
        } | undefined;
        token?: string | undefined;
        accountCreated?: boolean | undefined;
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
            quantity: number;
            variantId: string;
            unitPrice: number;
            totalPrice: number;
            productName: string;
            variantName: string;
            productId: string;
            orderId: string;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: number;
        promoCode: string | null;
        orderNumber: string;
        total: number;
        customerInfo: import("@prisma/client/runtime/library").JsonValue;
        guestToken: string | null;
        userId: string | null;
        promoId: string | null;
        discount: number;
    }>;
    createOrderForUser(userId: string, data: CreateOrderInput): Promise<{
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
            quantity: number;
            variantId: string;
            unitPrice: number;
            totalPrice: number;
            productName: string;
            variantName: string;
            productId: string;
            orderId: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: number;
        promoCode: string | null;
        orderNumber: string;
        total: number;
        customerInfo: import("@prisma/client/runtime/library").JsonValue;
        guestToken: string | null;
        userId: string | null;
        promoId: string | null;
        discount: number;
    }>;
    createOrder(userIdOrGuestToken: string, data: CreateOrderInput, isUser?: boolean): Promise<{
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
            quantity: number;
            variantId: string;
            unitPrice: number;
            totalPrice: number;
            productName: string;
            variantName: string;
            productId: string;
            orderId: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: number;
        promoCode: string | null;
        orderNumber: string;
        total: number;
        customerInfo: import("@prisma/client/runtime/library").JsonValue;
        guestToken: string | null;
        userId: string | null;
        promoId: string | null;
        discount: number;
    }>;
    private processOrder;
    getOrders(params?: {
        page?: number;
        limit?: number;
        status?: string;
        userId?: string;
        isAdmin?: boolean;
    }): Promise<any>;
    getOrderById(id: string, userId?: string): Promise<{
        items: ({
            product: {
                id: string;
                name: string;
                slug: string;
                images: string[];
            };
            variant: {
                id: string;
                name: string;
                sku: string;
                attributes: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            variantId: string;
            unitPrice: number;
            totalPrice: number;
            productName: string;
            variantName: string;
            productId: string;
            orderId: string;
        })[];
        promo: {
            id: string;
            name: string;
            code: string;
            type: import(".prisma/client").$Enums.PromoType;
            value: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: number;
        promoCode: string | null;
        orderNumber: string;
        total: number;
        customerInfo: import("@prisma/client/runtime/library").JsonValue;
        guestToken: string | null;
        userId: string | null;
        promoId: string | null;
        discount: number;
    }>;
    getOrderByNumber(orderNumber: string, userId?: string): Promise<{
        items: ({
            product: {
                id: string;
                name: string;
                slug: string;
                images: string[];
            };
            variant: {
                id: string;
                name: string;
                sku: string;
                attributes: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: number;
            variantId: string;
            unitPrice: number;
            totalPrice: number;
            productName: string;
            variantName: string;
            productId: string;
            orderId: string;
        })[];
        promo: {
            id: string;
            name: string;
            code: string;
            type: import(".prisma/client").$Enums.PromoType;
            value: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: number;
        promoCode: string | null;
        orderNumber: string;
        total: number;
        customerInfo: import("@prisma/client/runtime/library").JsonValue;
        guestToken: string | null;
        userId: string | null;
        promoId: string | null;
        discount: number;
    }>;
    updateOrderStatus(id: string, status: string, notes?: string): Promise<{
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
            quantity: number;
            variantId: string;
            unitPrice: number;
            totalPrice: number;
            productName: string;
            variantName: string;
            productId: string;
            orderId: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        subtotal: number;
        promoCode: string | null;
        orderNumber: string;
        total: number;
        customerInfo: import("@prisma/client/runtime/library").JsonValue;
        guestToken: string | null;
        userId: string | null;
        promoId: string | null;
        discount: number;
    }>;
    private generateOrderNumber;
    private createOrderWithoutTransaction;
    getOrderAnalytics(startDate?: string, endDate?: string): Promise<{
        summary: {
            totalRevenue: number;
            totalOrders: number;
            averageOrderValue: number;
        };
        ordersByStatus: Record<string, number>;
        recentOrders: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderNumber: string;
            total: number;
            customerInfo: import("@prisma/client/runtime/library").JsonValue;
        }[];
        topProducts: {
            productId: string;
            productName: string;
            totalSold: number;
            revenue: number;
        }[];
    }>;
}
declare const _default: OrderService;
export default _default;
//# sourceMappingURL=orderService.d.ts.map