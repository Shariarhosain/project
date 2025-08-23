import { prisma } from '../lib/prisma';
import { CreateOrderInput } from '../schemas/validation';
import { createError } from '../middleware/errorHandler';
import promoService from './promoService';

export class OrderService {
  async createOrder(guestToken: string, data: CreateOrderInput) {
    const { customerInfo, promoCode } = data;
    
    // Get cart with items
    const cart = await prisma.cart.findUnique({
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
    
    if (!cart) {
      throw createError('Cart not found', 404);
    }
    
    if (cart.items.length === 0) {
      throw createError('Cart is empty', 400);
    }
    
    // Check inventory for all items
    for (const item of cart.items) {
      if (item.variant.inventory < item.quantity) {
        throw createError(
          `Insufficient inventory for ${item.product.name} - ${item.variant.name}. Only ${item.variant.inventory} available.`,
          400
        );
      }
    }
    
    // Calculate cart totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.variant.price * item.quantity);
    }, 0);
    
    let discount = 0;
    let promo = null;
    let promoId = null;
    
    // Apply promo if provided
    if (promoCode) {
      try {
        promo = await promoService.validatePromo(promoCode, subtotal);
        discount = await promoService.calculateDiscount(promo, subtotal);
        promoId = promo.id;
      } catch (error) {
        throw error; // Re-throw promo validation errors
      }
    }
    
    const total = subtotal - discount;
    
    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();
    
    // Create order without transaction (for MongoDB without replica set)
    const order = await this.createOrderWithoutTransaction(cart, subtotal, discount, total, promo, promoId, promoCode, customerInfo, orderNumber);
    
    return order;
  }
  
  async getOrders(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    
    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
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
      throw createError('Order not found', 404);
    }
    
    return order;
  }
  
  async getOrderByNumber(orderNumber: string) {
    const order = await prisma.order.findUnique({
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
      throw createError('Order not found', 404);
    }
    
    return order;
  }
  
  async updateOrderStatus(id: string, status: string) {
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    
    if (!validStatuses.includes(status)) {
      throw createError('Invalid order status', 400);
    }
    
    const order = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!order) {
      throw createError('Order not found', 404);
    }
    
    return await prisma.order.update({
      where: { id },
      data: { status: status as any },
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
  
  async getOrderAnalytics() {
    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);
    
    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      recentOrders,
    };
  }
  
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    // Count orders created today
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayOrderCount = await prisma.order.count({
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
  
  private async createOrderWithoutTransaction(
    cart: any,
    subtotal: number,
    discount: number,
    total: number,
    promo: any,
    promoId: string | null,
    promoCode: string | undefined,
    customerInfo: any,
    orderNumber: string
  ) {
    // Create order
    const newOrder = await prisma.order.create({
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
          create: cart.items.map((item: any) => ({
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
    
    // Update inventory (individual operations since no transactions)
    for (const item of cart.items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          inventory: {
            decrement: item.quantity,
          },
        },
      });
    }
    
    // Increment promo usage if used
    if (promoId) {
      await promoService.incrementPromoUsage(promoId);
    }
    
    // Clear cart (note: this may fail if MongoDB requires replica set)
    try {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    } catch (error) {
      console.warn('Could not clear cart automatically. Items will remain in cart.');
    }
    
    return newOrder;
  }
}

export default new OrderService();
