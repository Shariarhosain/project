import { prisma } from '../lib/prisma';
import { CreateOrderInput } from '../schemas/validation';
import { createError } from '../middleware/errorHandler';
import promoService from './promoService';
import cartService from './cartService';
import userService from './UserService';

export class OrderService {
  /**
   * Create order for guests with optional account creation
   */
  async createOrderForGuestOrUser(guestTokenOrUserId: string, data: CreateOrderInput, isUser: boolean = false) {
    const { customerInfo, promoCode, createAccount, password } = data;
    
    // Get cart - handle both guest and user carts
    const cart = await cartService.getOrCreateCart(isUser ? undefined : guestTokenOrUserId, isUser ? guestTokenOrUserId : undefined);
    
    if (!cart || cart.items.length === 0) {
      throw createError(
        isUser 
          ? 'Your cart is empty. Please add items to your cart before creating an order.' 
          : 'Cart is empty. Please add items to your cart before creating an order. Use the guest token from the X-Guest-Token header for subsequent requests.',
        400
      );
    }
    
    let userId = isUser ? guestTokenOrUserId : undefined;
    let newUserData = null;
    
    // If guest wants to create account, create the user first
    if (!isUser && createAccount && password) {
      try {
        // Check if user with this email already exists
        const existingUser = await prisma.user.findFirst({
          where: { email: customerInfo.email }
        });
        
        if (existingUser) {
          throw createError('An account with this email already exists. Please login instead.', 409);
        }
        
        // Register new user with guest cart transfer
        const registerResult = await userService.registerWithGuestCart({
          email: customerInfo.email,
          password: password,
          name: customerInfo.name
        }, guestTokenOrUserId);
        
        userId = registerResult.user.id;
        newUserData = {
          user: registerResult.user,
          token: registerResult.token
        };
      } catch (error: any) {
        // If user creation fails, we can still create the order as guest
        console.error('Failed to create user account during order:', error);
        if (error.statusCode === 409) {
          throw error; // Re-throw user exists error
        }
        // For other errors, continue as guest order
      }
    }
    
    // Create the order
    const order = await this.processOrder(cart, data, userId);
    
    // Return order with optional user data
    return {
      ...order,
      ...(newUserData && { 
        accountCreated: true,
        ...newUserData
      })
    };
  }
  /**
   * Create order for authenticated user
   */
  async createOrderForUser(userId: string, data: CreateOrderInput) {
    const { customerInfo, promoCode } = data;
    
    // Get user's cart
    const cart = await cartService.getOrCreateCart(undefined, userId);
    
    if (!cart || cart.items.length === 0) {
      throw createError('Cart is empty', 400);
    }
    
    return await this.processOrder(cart, data, userId);
  }

  /**
   * Create order for guest (legacy method - kept for backward compatibility)
   */
  async createOrder(userIdOrGuestToken: string, data: CreateOrderInput, isUser: boolean = false) {
    const { customerInfo, promoCode } = data;
    
    // Get cart with items - different query based on user type
    const cart = await prisma.cart.findFirst({
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
      throw createError('Cart not found', 404);
    }
    
    if (cart.items.length === 0) {
      throw createError('Cart is empty', 400);
    }
    
    return await this.processOrder(cart, data, isUser ? userIdOrGuestToken : undefined);
  }

  /**
   * Process order creation (common logic)
   */
  private async processOrder(cart: any, data: CreateOrderInput, userId?: string) {
    const { customerInfo, paymentInfo, promoCode } = data;
    
    // Validate payment information (optional for now)
    if (paymentInfo) {
      // Payment validation logic can be added here
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
    const subtotal = cart.items.reduce((sum: number, item: any) => {
      return sum + (item.variant.price * item.quantity);
    }, 0);
    
    let discount = 0;
    let promo: any = null;
    let promoId: string | null = null;
    
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
    const order = await this.createOrderWithoutTransaction(cart, subtotal, discount, total, promo, promoId, promoCode, customerInfo, paymentInfo, orderNumber, userId);
    
    return order;
  }
  
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    isAdmin?: boolean;
  } = {}) {
    const { page = 1, limit = 10, status, userId, isAdmin = false } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    // If not admin, filter by userId
    if (!isAdmin && userId) {
      where.userId = userId;
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
      prisma.order.count({ where }),
    ]);
    
    const result: any = {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    // Add analytics for admin users
    if (isAdmin) {
      const [totalRevenue, orderCounts] = await Promise.all([
        prisma.order.aggregate({
          _sum: {
            total: true,
          },
          where: {
            status: {
              in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
            },
          },
        }),
        prisma.order.groupBy({
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
        }, {} as Record<string, number>),
      };
    }
    
    return result;
  }
  
  async getOrderById(id: string, userId?: string) {
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
    
    // If userId is provided, verify order ownership (admins can access any order)
    if (userId && order.userId !== userId) {
      throw createError('Access denied: You can only view your own orders', 403);
    }
    
    return order;
  }
  
  async getOrderByNumber(orderNumber: string, userId?: string) {
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
    
    // If userId is provided, verify order ownership (for logged-in users)
    if (userId && order.userId && order.userId !== userId) {
      throw createError('Access denied: You can only view your own orders', 403);
    }
    
    return order;
  }
  
  async updateOrderStatus(id: string, status: string, notes?: string) {
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
      data: { 
        status: status as any,
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
    paymentInfo: any,
    orderNumber: string,
    userId?: string
  ) {
    // Create order
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || undefined,
        guestToken: cart.guestToken,
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100,
        promoId,
        promoCode,
        customerInfo,
        paymentInfo: paymentInfo || null,
        transactionId: paymentInfo?.transactionId || null,
        paymentMethod: paymentInfo?.method || null,
        paymentStatus: paymentInfo ? 'COMPLETED' : 'PENDING', // If payment info provided, mark as completed
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

  async getOrderAnalytics(startDate?: string, endDate?: string) {
    const whereClause: any = {};
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    // Get basic statistics
    const [totalStats, ordersByStatus, recentOrders] = await Promise.all([
      prisma.order.aggregate({
        where: whereClause,
        _sum: { total: true },
        _count: { id: true },
        _avg: { total: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { status: true },
      }),
      prisma.order.findMany({
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

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: whereClause,
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    // Enhance top products with product details
    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, slug: true },
        });
        return {
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          totalSold: item._sum?.quantity || 0,
          revenue: item._sum?.totalPrice || 0,
        };
      })
    );

    return {
      summary: {
        totalRevenue: totalStats._sum.total || 0,
        totalOrders: totalStats._count.id || 0,
        averageOrderValue: totalStats._avg.total || 0,
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      recentOrders,
      topProducts: productsWithDetails,
    };
  }
}

export default new OrderService();
