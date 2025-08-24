"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../utils/auth");
class CartService {
    async transferGuestCartToUser(guestToken, userId) {
        const guestCart = await prisma_1.prisma.cart.findUnique({
            where: { guestToken },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
            },
        });
        if (!guestCart || guestCart.items.length === 0) {
            return null;
        }
        let userCart = await prisma_1.prisma.cart.findFirst({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
            },
        });
        if (!userCart) {
            userCart = await prisma_1.prisma.cart.update({
                where: { id: guestCart.id },
                data: {
                    userId,
                    guestToken: null,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                            variant: true,
                        },
                    },
                },
            });
            return userCart;
        }
        for (const guestItem of guestCart.items) {
            const existingItem = userCart.items.find(item => item.variantId === guestItem.variantId);
            if (existingItem) {
                await prisma_1.prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + guestItem.quantity },
                });
            }
            else {
                await prisma_1.prisma.cartItem.create({
                    data: {
                        cartId: userCart.id,
                        productId: guestItem.productId,
                        variantId: guestItem.variantId,
                        quantity: guestItem.quantity,
                    },
                });
            }
        }
        await prisma_1.prisma.cart.delete({
            where: { id: guestCart.id },
        });
        return await this.getOrCreateCart(undefined, userId);
    }
    async getOrCreateCart(guestToken, userId) {
        if (guestToken) {
            const existingCart = await prisma_1.prisma.cart.findUnique({
                where: { guestToken },
                include: {
                    items: {
                        include: {
                            product: true,
                            variant: true,
                        },
                    },
                    promo: true,
                },
            });
            if (existingCart && existingCart.expiresAt > new Date()) {
                const totals = await this.calculateCartTotals(existingCart.id);
                const finalSubtotal = totals.subtotal - existingCart.discount;
                return {
                    ...existingCart,
                    ...totals,
                    finalSubtotal: Math.round(finalSubtotal * 100) / 100,
                    discountApplied: existingCart.discount > 0,
                };
            }
            if (guestToken) {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
                const newCart = await prisma_1.prisma.cart.create({
                    data: {
                        guestToken,
                        userId,
                        expiresAt,
                    },
                    include: {
                        items: {
                            include: {
                                product: true,
                                variant: true,
                            },
                        },
                        promo: true,
                    },
                });
                const totals = await this.calculateCartTotals(newCart.id);
                const finalSubtotal = totals.subtotal - newCart.discount;
                return {
                    ...newCart,
                    ...totals,
                    finalSubtotal: Math.round(finalSubtotal * 100) / 100,
                    discountApplied: newCart.discount > 0,
                };
            }
        }
        const newGuestToken = (0, auth_1.generateGuestToken)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        const newCart = await prisma_1.prisma.cart.create({
            data: {
                guestToken: newGuestToken,
                userId,
                expiresAt,
            },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
                promo: true,
            },
        });
        const totals = await this.calculateCartTotals(newCart.id);
        const finalSubtotal = totals.subtotal - newCart.discount;
        return {
            ...newCart,
            ...totals,
            finalSubtotal: Math.round(finalSubtotal * 100) / 100,
            discountApplied: newCart.discount > 0,
        };
    }
    async getCart(guestToken) {
        const cart = await prisma_1.prisma.cart.findUnique({
            where: { guestToken },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                images: true,
                                status: true,
                            },
                        },
                        variant: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                price: true,
                                inventory: true,
                                attributes: true,
                            },
                        },
                    },
                },
                promo: true,
            },
        });
        if (!cart) {
            throw (0, errorHandler_1.createError)('Cart not found', 404);
        }
        if (cart.expiresAt < new Date()) {
            throw (0, errorHandler_1.createError)('Cart has expired', 410);
        }
        const totals = await this.calculateCartTotals(cart.id);
        const finalSubtotal = totals.subtotal - cart.discount;
        return {
            ...cart,
            ...totals,
            finalSubtotal: Math.round(finalSubtotal * 100) / 100,
            discountApplied: cart.discount > 0,
        };
    }
    async addToCart(guestTokenOrUserId, data, userId) {
        const { variantId, quantity } = data;
        const variant = await prisma_1.prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true },
        });
        if (!variant) {
            throw (0, errorHandler_1.createError)('Product variant not found', 404);
        }
        if (variant.product.status !== 'ACTIVE') {
            throw (0, errorHandler_1.createError)('Product is not available', 400);
        }
        if (variant.inventory < quantity) {
            throw (0, errorHandler_1.createError)(`Only ${variant.inventory} items available in stock`, 400);
        }
        const cart = userId
            ? await this.getOrCreateCart(undefined, userId)
            : await this.getOrCreateCart(guestTokenOrUserId);
        const existingItem = await prisma_1.prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId,
                },
            },
        });
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (variant.inventory < newQuantity) {
                throw (0, errorHandler_1.createError)(`Only ${variant.inventory} items available in stock`, 400);
            }
            await prisma_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        }
        else {
            await prisma_1.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: variant.productId,
                    variantId,
                    quantity,
                },
            });
        }
        return userId
            ? await this.getOrCreateCart(undefined, userId)
            : await this.getCart(guestTokenOrUserId);
    }
    async updateCartItem(guestToken, itemId, data) {
        const { quantity } = data;
        const cart = await prisma_1.prisma.cart.findUnique({
            where: { guestToken },
        });
        if (!cart) {
            throw (0, errorHandler_1.createError)('Cart not found', 404);
        }
        const cartItem = await prisma_1.prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id,
            },
            include: { variant: true },
        });
        if (!cartItem) {
            throw (0, errorHandler_1.createError)('Cart item not found', 404);
        }
        if (cartItem.variant.inventory < quantity) {
            throw (0, errorHandler_1.createError)(`Only ${cartItem.variant.inventory} items available in stock`, 400);
        }
        await prisma_1.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });
        return await this.getCart(guestToken);
    }
    async removeCartItem(guestToken, itemId) {
        const cart = await prisma_1.prisma.cart.findUnique({
            where: { guestToken },
        });
        if (!cart) {
            throw (0, errorHandler_1.createError)('Cart not found', 404);
        }
        const cartItem = await prisma_1.prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id,
            },
        });
        if (!cartItem) {
            throw (0, errorHandler_1.createError)('Cart item not found', 404);
        }
        await prisma_1.prisma.cartItem.delete({
            where: { id: itemId },
        });
        return await this.getCart(guestToken);
    }
    async clearCart(guestToken) {
        const cart = await prisma_1.prisma.cart.findUnique({
            where: { guestToken },
        });
        if (!cart) {
            throw (0, errorHandler_1.createError)('Cart not found', 404);
        }
        await prisma_1.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return await this.getCart(guestToken);
    }
    async calculateCartTotals(cartId) {
        const result = await prisma_1.prisma.cartItem.aggregate({
            where: { cartId },
            _sum: {
                quantity: true,
            },
        });
        const items = await prisma_1.prisma.cartItem.findMany({
            where: { cartId },
            include: { variant: true },
        });
        const subtotal = items.reduce((sum, item) => {
            return sum + (item.variant.price * item.quantity);
        }, 0);
        return {
            itemCount: result._sum.quantity || 0,
            subtotal: Math.round(subtotal * 100) / 100,
        };
    }
    async applyPromoToCart(guestToken, userId, promoId, promoCode, discount) {
        let cart;
        if (userId) {
            cart = await prisma_1.prisma.cart.findFirst({
                where: { userId },
            });
        }
        else if (guestToken) {
            cart = await prisma_1.prisma.cart.findUnique({
                where: { guestToken },
            });
        }
        if (!cart) {
            throw (0, errorHandler_1.createError)('Cart not found', 404);
        }
        await prisma_1.prisma.cart.update({
            where: { id: cart.id },
            data: {
                promoId,
                promoCode,
                discount,
            },
        });
        if (userId) {
            return await this.getUserCart(userId);
        }
        else {
            return await this.getCart(guestToken);
        }
    }
    async removePromoFromCart(guestToken, userId) {
        let cart;
        if (userId) {
            cart = await prisma_1.prisma.cart.findFirst({
                where: { userId },
            });
        }
        else if (guestToken) {
            cart = await prisma_1.prisma.cart.findUnique({
                where: { guestToken },
            });
        }
        if (!cart) {
            throw (0, errorHandler_1.createError)('Cart not found', 404);
        }
        await prisma_1.prisma.cart.update({
            where: { id: cart.id },
            data: {
                promoId: null,
                promoCode: null,
                discount: 0,
            },
        });
        if (userId) {
            return await this.getUserCart(userId);
        }
        else {
            return await this.getCart(guestToken);
        }
    }
    async getUserCart(userId) {
        const cart = await prisma_1.prisma.cart.findFirst({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                images: true,
                                status: true,
                            },
                        },
                        variant: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                price: true,
                                inventory: true,
                                attributes: true,
                            },
                        },
                    },
                },
                promo: true,
            },
        });
        if (!cart) {
            throw (0, errorHandler_1.createError)('Cart not found', 404);
        }
        if (cart.expiresAt < new Date()) {
            throw (0, errorHandler_1.createError)('Cart has expired', 410);
        }
        const totals = await this.calculateCartTotals(cart.id);
        const finalSubtotal = totals.subtotal - cart.discount;
        return {
            ...cart,
            ...totals,
            finalSubtotal: Math.round(finalSubtotal * 100) / 100,
            discountApplied: cart.discount > 0,
        };
    }
}
exports.CartService = CartService;
exports.default = new CartService();
//# sourceMappingURL=cartService.js.map