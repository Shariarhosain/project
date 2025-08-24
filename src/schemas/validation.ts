import { z } from 'zod';

// Product schemas
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    slug: z.string().min(1, 'Slug is required'),
    images: z.array(z.string().url()).optional().default([]),
    category: z.string().min(1, 'Category is required'),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional().default('ACTIVE'),
    variants: z.array(z.object({
      name: z.string().min(1, 'Variant name is required'),
      sku: z.string().min(1, 'SKU is required'),
      price: z.number().positive('Price must be positive'),
      inventory: z.number().int().min(0, 'Inventory must be non-negative').default(0),
      attributes: z.record(z.any()).optional(),
    })).min(1, 'At least one variant is required'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    slug: z.string().min(1).optional(),
    images: z.array(z.string().url()).optional(),
    category: z.string().min(1).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
  }),
});

// Cart schemas
export const addToCartSchema = z.object({
  body: z.object({
    variantId: z.string().min(1, 'Variant ID is required'),
    quantity: z.number().int().positive('Quantity must be positive').default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
});

// Promo schemas
export const createPromoSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Promo code is required'),
    name: z.string().min(1, 'Promo name is required'),
    description: z.string().optional(),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().positive('Value must be positive'),
    minAmount: z.number().positive().optional(),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    validFrom: z.string().datetime(),
    validTo: z.string().datetime(),
  }),
});

export const applyPromoSchema = z.object({
  body: z.object({
    promoCode: z.string().min(1, 'Promo code is required'),
  }),
});

// Order schemas
export const createOrderSchema = z.object({
  body: z.object({
    customerInfo: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Valid email is required'),
      phone: z.string().optional(),
      address: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        zipCode: z.string().min(1, 'Zip code is required'),
        country: z.string().min(1, 'Country is required'),
      }),
    }),
    paymentInfo: z.object({
      method: z.enum(['credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay', 'bank_transfer', 'cash_on_delivery']),
      transactionId: z.string().min(1, 'Transaction ID is required'),
      cardLastFour: z.string().length(4).optional(), // Last 4 digits of card
      cardBrand: z.string().optional(), // e.g., "visa", "mastercard"
      paymentGateway: z.string().optional(), // e.g., "stripe", "paypal"
      gatewayResponse: z.record(z.any()).optional(), // Raw response from payment gateway
    }).optional(),
    promoCode: z.string().optional(),
    // Optional account creation for guests
    createAccount: z.boolean().optional().default(false),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  }).refine((data) => {
    // If createAccount is true, password must be provided
    if (data.createAccount && !data.password) {
      return false;
    }
    return true;
  }, {
    message: 'Password is required when creating an account',
    path: ['password']
  }),
});

// Query schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

export const productQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).optional(),
    search: z.string().optional(),
  }).merge(paginationSchema),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];
export type CreatePromoInput = z.infer<typeof createPromoSchema>['body'];
export type ApplyPromoInput = z.infer<typeof applyPromoSchema>['body'];
export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type ProductQueryInput = z.infer<typeof productQuerySchema>['query'];
