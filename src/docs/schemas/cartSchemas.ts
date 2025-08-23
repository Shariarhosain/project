/**
 * Shopping Cart Schemas
 * Schemas for cart management, items, and guest/user carts
 */

export const cartSchemas = {
  // Core Cart Schema
  Cart: {
    type: 'object',
    required: ['id', 'items', 'itemCount', 'subtotal'],
    properties: {
      id: {
        type: 'string',
        description: 'Cart identifier',
        example: '64f5e8b12345abcd67890126'
      },
      userId: {
        type: 'string',
        description: 'User ID (for authenticated users)',
        example: '64f5e8b12345abcd67890123'
      },
      guestToken: {
        type: 'string',
        description: 'JWT token for guest cart access',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CartItem'
        }
      },
      itemCount: {
        type: 'integer',
        description: 'Total number of items',
        example: 3
      },
      subtotal: {
        type: 'number',
        format: 'float',
        description: 'Cart subtotal',
        example: 59.97
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  
  // Cart Item Schema
  CartItem: {
    type: 'object',
    required: ['id', 'quantity', 'product', 'variant'],
    properties: {
      id: {
        type: 'string',
        example: '64f5e8b12345abcd67890127'
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        example: 2
      },
      product: {
        $ref: '#/components/schemas/Product'
      },
      variant: {
        $ref: '#/components/schemas/ProductVariant'
      },
      subtotal: {
        type: 'number',
        format: 'float',
        description: 'Item subtotal (quantity × price)',
        example: 39.98
      }
    }
  },
  
  // Request Schemas
  AddToCartRequest: {
    type: 'object',
    required: ['variantId', 'quantity'],
    properties: {
      variantId: {
        type: 'string',
        description: 'Product variant ID to add',
        example: '64f5e8b12345abcd67890125'
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        maximum: 99,
        description: 'Quantity to add',
        example: 2
      }
    }
  },
  
  UpdateCartItemRequest: {
    type: 'object',
    required: ['quantity'],
    properties: {
      quantity: {
        type: 'integer',
        minimum: 1,
        maximum: 99,
        description: 'New quantity',
        example: 3
      }
    }
  },
  
  // Response Schemas
  CartResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Item added to cart successfully'
      },
      cart: {
        $ref: '#/components/schemas/Cart'
      },
      guestToken: {
        type: 'string',
        description: 'Guest token (for guest users)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  }
};
