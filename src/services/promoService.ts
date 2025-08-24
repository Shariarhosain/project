import { prisma } from '../lib/prisma';
import { CreatePromoInput, ApplyPromoInput } from '../schemas/validation';
import { createError } from '../middleware/errorHandler';
import cartService from './cartService';

export class PromoService {
  async createPromo(data: CreatePromoInput) {
    const { validFrom, validTo, ...promoData } = data;
    
    // Check if promo code already exists
    const existingPromo = await prisma.promo.findUnique({
      where: { code: promoData.code },
    });
    
    if (existingPromo) {
      throw createError('Promo code already exists', 409);
    }
    
    // Validate dates
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);
    
    if (fromDate >= toDate) {
      throw createError('Valid from date must be before valid to date', 400);
    }
    
    if (toDate < new Date()) {
      throw createError('Valid to date must be in the future', 400);
    }
    
    // Validate percentage value
    if (promoData.type === 'PERCENTAGE' && promoData.value > 100) {
      throw createError('Percentage value cannot exceed 100', 400);
    }
    
    return await prisma.promo.create({
      data: {
        ...promoData,
        validFrom: fromDate,
        validTo: toDate,
      },
    });
  }
  
  async getPromos(page = 1, limit = 10, isAdmin = false) {
    const skip = (page - 1) * limit;
    
    // For public users, only show active promos that are currently valid
    const where = isAdmin ? {} : {
      status: 'ACTIVE' as const,
      validFrom: { lte: new Date() },
      validTo: { gte: new Date() }
    };
    
    const [promos, total] = await Promise.all([
      prisma.promo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.promo.count({ where }),
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
  
  async getPromoById(id: string) {
    const promo = await prisma.promo.findUnique({
      where: { id },
    });
    
    if (!promo) {
      throw createError('Promo not found', 404);
    }
    
    return promo;
  }
  
  async validatePromo(code: string, cartSubtotal: number) {
    const promo = await prisma.promo.findUnique({
      where: { code },
    });
    
    if (!promo) {
      throw createError('Invalid promo code', 404);
    }
    
    if (promo.status !== 'ACTIVE') {
      throw createError('Promo code is not active', 400);
    }
    
    const now = new Date();
    if (now < promo.validFrom || now > promo.validTo) {
      throw createError('Promo code has expired or is not yet valid', 400);
    }
    
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw createError('Promo code usage limit exceeded', 400);
    }
    
    if (promo.minAmount && cartSubtotal < promo.minAmount) {
      throw createError(`Minimum cart amount of $${promo.minAmount} required`, 400);
    }
    
    return promo;
  }
  
  async calculateDiscount(promo: any, cartSubtotal: number) {
    let discount = 0;
    
    if (promo.type === 'PERCENTAGE') {
      discount = (cartSubtotal * promo.value) / 100;
      
      // Apply max discount limit if specified
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else if (promo.type === 'FIXED') {
      discount = promo.value;
      
      // Discount cannot exceed cart subtotal
      if (discount > cartSubtotal) {
        discount = cartSubtotal;
      }
    }
    
    return Math.round(discount * 100) / 100; // Round to 2 decimal places
  }
  
  async applyPromoToCart(guestToken?: string, promoCode?: string, userId?: string) {
    if (!promoCode) {
      throw createError('Promo code is required', 400);
    }

    // Get or create cart - this ensures a cart exists
    let cart;
    if (userId) {
      cart = await cartService.getOrCreateCart(undefined, userId);
    } else {
      cart = await cartService.getOrCreateCart(guestToken);
    }
    
    if (cart.items.length === 0) {
      throw createError('Cart is empty', 400);
    }

    // Calculate cart subtotal
    const cartSubtotal = cart.items.reduce((sum, item) => {
      return sum + (item.variant.price * item.quantity);
    }, 0);

    // Validate promo
    const promo = await this.validatePromo(promoCode, cartSubtotal);
    
    // Calculate discount
    const discount = await this.calculateDiscount(promo, cartSubtotal);
    
    // Apply promo to cart
    const cartWithPromo = await cartService.applyPromoToCart(
      guestToken,
      userId,
      promo.id, 
      promo.code, 
      discount
    );
    
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

  async removePromoFromCart(guestToken?: string, userId?: string) {
    // Get cart
    let cart;
    if (userId) {
      cart = await cartService.getOrCreateCart(undefined, userId);
    } else {
      cart = await cartService.getOrCreateCart(guestToken);
    }

    if (!cart.promoCode) {
      throw createError('No promo code applied to cart', 400);
    }

    // Remove promo from cart
    const updatedCart = await cartService.removePromoFromCart(guestToken, userId);

    return {
      message: 'Promo code removed successfully',
      cart: updatedCart
    };
  }
  
  async updatePromo(id: string, data: Partial<CreatePromoInput>) {
    const promo = await prisma.promo.findUnique({
      where: { id },
    });
    
    if (!promo) {
      throw createError('Promo not found', 404);
    }
    
    const updateData: any = { ...data };
    
    if (data.validFrom) {
      updateData.validFrom = new Date(data.validFrom);
    }
    
    if (data.validTo) {
      updateData.validTo = new Date(data.validTo);
    }
    
    // Validate dates if both are provided
    if (updateData.validFrom && updateData.validTo) {
      if (updateData.validFrom >= updateData.validTo) {
        throw createError('Valid from date must be before valid to date', 400);
      }
    }
    
    return await prisma.promo.update({
      where: { id },
      data: updateData,
    });
  }
  
  async deletePromo(id: string) {
    const promo = await prisma.promo.findUnique({
      where: { id },
    });
    
    if (!promo) {
      throw createError('Promo not found', 404);
    }
    
    await prisma.promo.delete({
      where: { id },
    });
  }
  
  async incrementPromoUsage(promoId: string) {
    await prisma.promo.update({
      where: { id: promoId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }
}

export default new PromoService();
