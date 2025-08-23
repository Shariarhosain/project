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