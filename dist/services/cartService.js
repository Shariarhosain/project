"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../utils/auth");
class CartService {
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
                },
            });
            if (existingCart && existingCart.expiresAt > new Date()) {
                return existingCart;
            }
        }
        const newGuestToken = guestToken || (0, auth_1.generateGuestToken)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        return await prisma_1.prisma.cart.create({
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
            },
        });
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
            },
        });
        if (!cart) {
            throw (0, errorHandler_1.createError)('Cart not found', 404);
        }
        if (cart.expiresAt < new Date()) {
            throw (0, errorHandler_1.createError)('Cart has expired', 410);
        }
        const totals = await this.calculateCartTotals(cart.id);
        return {
            ...cart,
            ...totals,
        };
    }
    async addToCart(guestToken, data) {
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
        const cart = await this.getOrCreateCart(guestToken);
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
        return await this.getCart(guestToken);
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
}
exports.CartService = CartService;
exports.default = new CartService();
//# sourceMappingURL=cartService.js.map