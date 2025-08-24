import { prisma } from '../lib/prisma';
import { AddToCartInput, UpdateCartItemInput } from '../schemas/validation';
import { createError } from '../middleware/errorHandler';
import { generateGuestToken } from '../utils/auth';

export class CartService {
  /**
   * Transfer guest cart items to user account during registration/login
   */
  async transferGuestCartToUser(guestToken: string, userId: string) {
    // Find the guest cart
    const guestCart = await prisma.cart.findUnique({
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
      return null; // No guest cart or empty cart
    }

    // Check if user already has a cart
    let userCart = await prisma.cart.findFirst({
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

    // If user doesn't have a cart, convert the guest cart to user cart
    if (!userCart) {
      userCart = await prisma.cart.update({
        where: { id: guestCart.id },
        data: {
          userId,
          guestToken: null, // Remove guest token
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

    // If user already has a cart, merge items from guest cart
    for (const guestItem of guestCart.items) {
      // Check if this variant already exists in user cart
      const existingItem = userCart.items.find(
        item => item.variantId === guestItem.variantId
      );

      if (existingItem) {
        // Update quantity of existing item
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + guestItem.quantity },
        });
      } else {
        // Add new item to user cart
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
          },
        });
      }
    }

    // Delete the guest cart after transfer
    await prisma.cart.delete({
      where: { id: guestCart.id },
    });

    // Return updated user cart
    return await this.getOrCreateCart(undefined, userId);
  }
  async getOrCreateCart(guestToken?: string, userId?: string) {
    // If guest token provided, try to find existing cart
    if (guestToken) {
      const existingCart = await prisma.cart.findUnique({
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
        // Calculate totals for existing cart
        const totals = await this.calculateCartTotals(existingCart.id);
        const finalSubtotal = totals.subtotal - existingCart.discount;
        
        return {
          ...existingCart,
          ...totals,
          finalSubtotal: Math.round(finalSubtotal * 100) / 100,
          discountApplied: existingCart.discount > 0,
        };
      }
      
      // If cart doesn't exist or expired, create new cart with the SAME guest token
      if (guestToken) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Cart expires in 30 days

        const newCart = await prisma.cart.create({
          data: {
            guestToken, // Use the provided guest token, don't generate new one
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

        // Calculate totals for new cart
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
    
    // Create new cart with new guest token (only when no guest token provided)
    const newGuestToken = generateGuestToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Cart expires in 30 days

    const newCart = await prisma.cart.create({
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

    // Calculate totals for new cart
    const totals = await this.calculateCartTotals(newCart.id);
    const finalSubtotal = totals.subtotal - newCart.discount;
    
    return {
      ...newCart,
      ...totals,
      finalSubtotal: Math.round(finalSubtotal * 100) / 100,
      discountApplied: newCart.discount > 0,
    };
  }
  
  async getCart(guestToken: string) {
    const cart = await prisma.cart.findUnique({
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
      throw createError('Cart not found', 404);
    }
    
    if (cart.expiresAt < new Date()) {
      throw createError('Cart has expired', 410);
    }
    
    // Calculate totals using aggregation
    const totals = await this.calculateCartTotals(cart.id);
    
    // Calculate final total with discount
    const finalSubtotal = totals.subtotal - cart.discount;
    
    return {
      ...cart,
      ...totals,
      finalSubtotal: Math.round(finalSubtotal * 100) / 100,
      discountApplied: cart.discount > 0,
    };
  }
  
  async addToCart(guestTokenOrUserId: string | undefined, data: AddToCartInput, userId?: string) {
    const { variantId, quantity } = data;
    
    // Check if variant exists and has enough inventory
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    
    if (!variant) {
      throw createError('Product variant not found', 404);
    }
    
    if (variant.product.status !== 'ACTIVE') {
      throw createError('Product is not available', 400);
    }
    
    if (variant.inventory < quantity) {
      throw createError(`Only ${variant.inventory} items available in stock`, 400);
    }
    
    // Get or create cart based on whether user is authenticated or guest
    const cart = userId 
      ? await this.getOrCreateCart(undefined, userId)
      : await this.getOrCreateCart(guestTokenOrUserId);
    
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
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
        throw createError(`Only ${variant.inventory} items available in stock`, 400);
      }
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: variant.productId,
          variantId,
          quantity,
        },
      });
    }
    
    // Return updated cart
    return userId 
      ? await this.getOrCreateCart(undefined, userId)
      : await this.getCart(guestTokenOrUserId!);
  }
  
  async updateCartItem(guestToken: string, itemId: string, data: UpdateCartItemInput) {
    const { quantity } = data;
    
    const cart = await prisma.cart.findUnique({
      where: { guestToken },
    });
    
    if (!cart) {
      throw createError('Cart not found', 404);
    }
    
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: { variant: true },
    });
    
    if (!cartItem) {
      throw createError('Cart item not found', 404);
    }
    
    if (cartItem.variant.inventory < quantity) {
      throw createError(`Only ${cartItem.variant.inventory} items available in stock`, 400);
    }
    
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    
    return await this.getCart(guestToken);
  }
  
  async removeCartItem(guestToken: string, itemId: string) {
    const cart = await prisma.cart.findUnique({
      where: { guestToken },
    });
    
    if (!cart) {
      throw createError('Cart not found', 404);
    }
    
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });
    
    if (!cartItem) {
      throw createError('Cart item not found', 404);
    }
    
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
    
    return await this.getCart(guestToken);
  }
  
  async clearCart(guestToken: string) {
    const cart = await prisma.cart.findUnique({
      where: { guestToken },
    });
    
    if (!cart) {
      throw createError('Cart not found', 404);
    }
    
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    
    return await this.getCart(guestToken);
  }
  
  private async calculateCartTotals(cartId: string) {
    const result = await prisma.cartItem.aggregate({
      where: { cartId },
      _sum: {
        quantity: true,
      },
    });
    
    // Calculate subtotal using aggregation pipeline equivalent
    const items = await prisma.cartItem.findMany({
      where: { cartId },
      include: { variant: true },
    });
    
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.variant.price * item.quantity);
    }, 0);
    
    return {
      itemCount: result._sum.quantity || 0,
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
    };
  }

  async applyPromoToCart(guestToken?: string, userId?: string, promoId?: string, promoCode?: string, discount?: number) {
    let cart;

    if (userId) {
      cart = await prisma.cart.findFirst({
        where: { userId },
      });
    } else if (guestToken) {
      cart = await prisma.cart.findUnique({
        where: { guestToken },
      });
    }

    if (!cart) {
      throw createError('Cart not found', 404);
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        promoId,
        promoCode,
        discount,
      },
    });

    if (userId) {
      return await this.getUserCart(userId);
    } else {
      return await this.getCart(guestToken!);
    }
  }

  async removePromoFromCart(guestToken?: string, userId?: string) {
    let cart;

    if (userId) {
      cart = await prisma.cart.findFirst({
        where: { userId },
      });
    } else if (guestToken) {
      cart = await prisma.cart.findUnique({
        where: { guestToken },
      });
    }

    if (!cart) {
      throw createError('Cart not found', 404);
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        promoId: null,
        promoCode: null,
        discount: 0,
      },
    });

    if (userId) {
      return await this.getUserCart(userId);
    } else {
      return await this.getCart(guestToken!);
    }
  }

  async getUserCart(userId: string) {
    const cart = await prisma.cart.findFirst({
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
      throw createError('Cart not found', 404);
    }

    if (cart.expiresAt < new Date()) {
      throw createError('Cart has expired', 410);
    }

    // Calculate totals using aggregation
    const totals = await this.calculateCartTotals(cart.id);
    
    // Calculate final total with discount
    const finalSubtotal = totals.subtotal - cart.discount;
    
    return {
      ...cart,
      ...totals,
      finalSubtotal: Math.round(finalSubtotal * 100) / 100,
      discountApplied: cart.discount > 0,
    };
  }
}

export default new CartService();
