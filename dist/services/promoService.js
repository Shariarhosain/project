"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoService = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const cartService_1 = __importDefault(require("./cartService"));
class PromoService {
    async createPromo(data) {
        const { validFrom, validTo, ...promoData } = data;
        const existingPromo = await prisma_1.prisma.promo.findUnique({
            where: { code: promoData.code },
        });
        if (existingPromo) {
            throw (0, errorHandler_1.createError)('Promo code already exists', 409);
        }
        const fromDate = new Date(validFrom);
        const toDate = new Date(validTo);
        if (fromDate >= toDate) {
            throw (0, errorHandler_1.createError)('Valid from date must be before valid to date', 400);
        }
        if (toDate < new Date()) {
            throw (0, errorHandler_1.createError)('Valid to date must be in the future', 400);
        }
        if (promoData.type === 'PERCENTAGE' && promoData.value > 100) {
            throw (0, errorHandler_1.createError)('Percentage value cannot exceed 100', 400);
        }
        return await prisma_1.prisma.promo.create({
            data: {
                ...promoData,
                validFrom: fromDate,
                validTo: toDate,
            },
        });
    }
    async getPromos(page = 1, limit = 10, isAdmin = false) {
        const skip = (page - 1) * limit;
        const where = isAdmin ? {} : {
            status: 'ACTIVE',
            validFrom: { lte: new Date() },
            validTo: { gte: new Date() }
        };
        const [promos, total] = await Promise.all([
            prisma_1.prisma.promo.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.promo.count({ where }),
        ]);
        return {
            promos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPromoById(id) {
        const promo = await prisma_1.prisma.promo.findUnique({
            where: { id },
        });
        if (!promo) {
            throw (0, errorHandler_1.createError)('Promo not found', 404);
        }
        return promo;
    }
    async validatePromo(code, cartSubtotal) {
        const promo = await prisma_1.prisma.promo.findUnique({
            where: { code },
        });
        if (!promo) {
            throw (0, errorHandler_1.createError)('Invalid promo code', 404);
        }
        if (promo.status !== 'ACTIVE') {
            throw (0, errorHandler_1.createError)('Promo code is not active', 400);
        }
        const now = new Date();
        if (now < promo.validFrom || now > promo.validTo) {
            throw (0, errorHandler_1.createError)('Promo code has expired or is not yet valid', 400);
        }
        if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
            throw (0, errorHandler_1.createError)('Promo code usage limit exceeded', 400);
        }
        if (promo.minAmount && cartSubtotal < promo.minAmount) {
            throw (0, errorHandler_1.createError)(`Minimum cart amount of $${promo.minAmount} required`, 400);
        }
        return promo;
    }
    async calculateDiscount(promo, cartSubtotal) {
        let discount = 0;
        if (promo.type === 'PERCENTAGE') {
            discount = (cartSubtotal * promo.value) / 100;
            if (promo.maxDiscount && discount > promo.maxDiscount) {
                discount = promo.maxDiscount;
            }
        }
        else if (promo.type === 'FIXED') {
            discount = promo.value;
            if (discount > cartSubtotal) {
                discount = cartSubtotal;
            }
        }
        return Math.round(discount * 100) / 100;
    }
    async applyPromoToCart(guestToken, promoCode, userId) {
        if (!promoCode) {
            throw (0, errorHandler_1.createError)('Promo code is required', 400);
        }
        let cart;
        if (userId) {
            cart = await cartService_1.default.getOrCreateCart(undefined, userId);
        }
        else {
            cart = await cartService_1.default.getOrCreateCart(guestToken);
        }
        if (cart.items.length === 0) {
            throw (0, errorHandler_1.createError)('Cart is empty', 400);
        }
        const cartSubtotal = cart.items.reduce((sum, item) => {
            return sum + (item.variant.price * item.quantity);
        }, 0);
        const promo = await this.validatePromo(promoCode, cartSubtotal);
        const discount = await this.calculateDiscount(promo, cartSubtotal);
        const cartWithPromo = await cartService_1.default.applyPromoToCart(guestToken, userId, promo.id, promo.code, discount);
        return {
            message: 'Promo code applied successfully',
            promo: {
                id: promo.id,
                code: promo.code,
                name: promo.name,
                description: promo.description,
                type: promo.type,
                value: promo.value,
            },
            discount: {
                amount: discount,
                originalSubtotal: Math.round(cartSubtotal * 100) / 100,
                finalSubtotal: Math.round((cartSubtotal - discount) * 100) / 100,
            },
            cart: cartWithPromo
        };
    }
    async removePromoFromCart(guestToken, userId) {
        let cart;
        if (userId) {
            cart = await cartService_1.default.getOrCreateCart(undefined, userId);
        }
        else {
            cart = await cartService_1.default.getOrCreateCart(guestToken);
        }
        if (!cart.promoCode) {
            throw (0, errorHandler_1.createError)('No promo code applied to cart', 400);
        }
        const updatedCart = await cartService_1.default.removePromoFromCart(guestToken, userId);
        return {
            message: 'Promo code removed successfully',
            cart: updatedCart
        };
    }
    async updatePromo(id, data) {
        const promo = await prisma_1.prisma.promo.findUnique({
            where: { id },
        });
        if (!promo) {
            throw (0, errorHandler_1.createError)('Promo not found', 404);
        }
        const updateData = { ...data };
        if (data.validFrom) {
            updateData.validFrom = new Date(data.validFrom);
        }
        if (data.validTo) {
            updateData.validTo = new Date(data.validTo);
        }
        if (updateData.validFrom && updateData.validTo) {
            if (updateData.validFrom >= updateData.validTo) {
                throw (0, errorHandler_1.createError)('Valid from date must be before valid to date', 400);
            }
        }
        return await prisma_1.prisma.promo.update({
            where: { id },
            data: updateData,
        });
    }
    async deletePromo(id) {
        const promo = await prisma_1.prisma.promo.findUnique({
            where: { id },
        });
        if (!promo) {
            throw (0, errorHandler_1.createError)('Promo not found', 404);
        }
        await prisma_1.prisma.promo.delete({
            where: { id },
        });
    }
    async incrementPromoUsage(promoId) {
        await prisma_1.prisma.promo.update({
            where: { id: promoId },
            data: {
                usageCount: {
                    increment: 1,
                },
            },
        });
    }
}
exports.PromoService = PromoService;
exports.default = new PromoService();
//# sourceMappingURL=promoService.js.map