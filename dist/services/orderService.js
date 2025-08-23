"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const promoService_1 = __importDefault(require("./promoService"));
class OrderService {
    async createOrder(userIdOrGuestToken, data, isUser = false) {
        const { customerInfo, promoCode } = data;
        const cart = await prisma_1.prisma.cart.findFirst({
            where: isUser
                ? { userId: userIdOrGuestToken }
                : { guestToken: userIdOrGuestToken },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
            },
        });
        if (!cart) {
            throw (0, errorHandler_1.createError)('Cart not found', 404);
        }
        if (cart.items.length === 0) {
            throw (0, errorHandler_1.createError)('Cart is empty', 400);
        }
        for (const item of cart.items) {
            if (item.variant.inventory < item.quantity) {
                throw (0, errorHandler_1.createError)(`Insufficient inventory for ${item.product.name} - ${item.variant.name}. Only ${item.variant.inventory} available.`, 400);
            }
        }
        const subtotal = cart.items.reduce((sum, item) => {
            return sum + (item.variant.price * item.quantity);
        }, 0);
        let discount = 0;
        let promo = null;
        let promoId = null;
        if (promoCode) {
            try {
                promo = await promoService_1.default.validatePromo(promoCode, subtotal);
                discount = await promoService_1.default.calculateDiscount(promo, subtotal);
                promoId = promo.id;
            }
            catch (error) {
                throw error;
            }
        }
        const total = subtotal - discount;
        const orderNumber = await this.generateOrderNumber();
        const order = await this.createOrderWithoutTransaction(cart, subtotal, discount, total, promo, promoId, promoCode, customerInfo, orderNumber);
        return order;
    }
    async getOrders(params = {}) {
        const { page = 1, limit = 10, status, userId, isAdmin = false } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (!isAdmin && userId) {
            where.userId = userId;
        }
        const [orders, total] = await Promise.all([
            prisma_1.prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },
                            variant: {
                                select: {
                                    id: true,
                                    name: true,
                                    sku: true,
                                },
                            },
                        },
                    },
                    promo: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.order.count({ where }),
        ]);
        const result = {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
        if (isAdmin) {
            const [totalRevenue, orderCounts] = await Promise.all([
                prisma_1.prisma.order.aggregate({
                    _sum: {
                        total: true,
                    },
                    where: {
                        status: {
                            in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
                        },
                    },
                }),
                prisma_1.prisma.order.groupBy({
                    by: ['status'],
                    _count: {
                        status: true,
                    },
                }),
            ]);
            result.summary = {
                totalRevenue: totalRevenue._sum.total || 0,
                orderCounts: orderCounts.reduce((acc, curr) => {
                    acc[curr.status] = curr._count.status;
                    return acc;
                }, {}),
            };
        }
        return result;
    }
    async getOrderById(id, userId) {
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                images: true,
                            },
                        },
                        variant: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                attributes: true,
                            },
                        },
                    },
                },
                promo: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        type: true,
                        value: true,
                    },
                },
            },
        });
        if (!order) {
            throw (0, errorHandler_1.createError)('Order not found', 404);
        }
        if (userId && order.userId !== userId) {
            throw (0, errorHandler_1.createError)('Access denied: You can only view your own orders', 403);
        }
        return order;
    }
    async getOrderByNumber(orderNumber, userId) {
        const order = await prisma_1.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                images: true,
                            },
                        },
                        variant: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                attributes: true,
                            },
                        },
                    },
                },
                promo: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        type: true,
                        value: true,
                    },
                },
            },
        });
        if (!order) {
            throw (0, errorHandler_1.createError)('Order not found', 404);
        }
        if (userId && order.userId && order.userId !== userId) {
            throw (0, errorHandler_1.createError)('Access denied: You can only view your own orders', 403);
        }
        return order;
    }
    async updateOrderStatus(id, status, notes) {
        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
        if (!validStatuses.includes(status)) {
            throw (0, errorHandler_1.createError)('Invalid order status', 400);
        }
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
        });
        if (!order) {
            throw (0, errorHandler_1.createError)('Order not found', 404);
        }
        return await prisma_1.prisma.order.update({
            where: { id },
            data: {
                status: status,
                ...(notes && { notes })
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
    }
    async generateOrderNumber() {
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const todayOrderCount = await prisma_1.prisma.order.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        });
        const sequence = (todayOrderCount + 1).toString().padStart(4, '0');
        return `ORD${year}${month}${day}${sequence}`;
    }
    async createOrderWithoutTransaction(cart, subtotal, discount, total, promo, promoId, promoCode, customerInfo, orderNumber) {
        const newOrder = await prisma_1.prisma.order.create({
            data: {
                orderNumber,
                guestToken: cart.guestToken,
                subtotal: Math.round(subtotal * 100) / 100,
                discount: Math.round(discount * 100) / 100,
                total: Math.round(total * 100) / 100,
                promoId,
                promoCode,
                customerInfo,
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        unitPrice: item.variant.price,
                        totalPrice: Math.round(item.variant.price * item.quantity * 100) / 100,
                        productName: item.product.name,
                        variantName: item.variant.name,
                    })),
                },
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
        for (const item of cart.items) {
            await prisma_1.prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                    inventory: {
                        decrement: item.quantity,
                    },
                },
            });
        }
        if (promoId) {
            await promoService_1.default.incrementPromoUsage(promoId);
        }
        try {
            await prisma_1.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }
        catch (error) {
            console.warn('Could not clear cart automatically. Items will remain in cart.');
        }
        return newOrder;
    }
    async getOrderAnalytics(startDate, endDate) {
        const whereClause = {};
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate)
                whereClause.createdAt.gte = new Date(startDate);
            if (endDate)
                whereClause.createdAt.lte = new Date(endDate);
        }
        const [totalStats, ordersByStatus, recentOrders] = await Promise.all([
            prisma_1.prisma.order.aggregate({
                where: whereClause,
                _sum: { total: true },
                _count: { id: true },
                _avg: { total: true },
            }),
            prisma_1.prisma.order.groupBy({
                by: ['status'],
                where: whereClause,
                _count: { status: true },
            }),
            prisma_1.prisma.order.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    total: true,
                    createdAt: true,
                    customerInfo: true,
                },
            }),
        ]);
        const topProducts = await prisma_1.prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: whereClause,
            },
            _sum: { quantity: true, totalPrice: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10,
        });
        const productsWithDetails = await Promise.all(topProducts.map(async (item) => {
            const product = await prisma_1.prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, slug: true },
            });
            return {
                productId: item.productId,
                productName: product?.name || 'Unknown Product',
                totalSold: item._sum?.quantity || 0,
                revenue: item._sum?.totalPrice || 0,
            };
        }));
        return {
            summary: {
                totalRevenue: totalStats._sum.total || 0,
                totalOrders: totalStats._count.id || 0,
                averageOrderValue: totalStats._avg.total || 0,
            },
            ordersByStatus: ordersByStatus.reduce((acc, item) => {
                acc[item.status] = item._count.status;
                return acc;
            }, {}),
            recentOrders,
            topProducts: productsWithDetails,
        };
    }
}
exports.OrderService = OrderService;
exports.default = new OrderService();
//# sourceMappingURL=orderService.js.map