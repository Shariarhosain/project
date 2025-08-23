/**
 * Order Management Schemas
 * Schemas for orders, order items, and order processing
 */

export const orderSchemas = {
  // Core Order Schema
  Order: {
    type: 'object',
    required: ['id', 'orderNumber', 'status', 'subtotal', 'total', 'items'],
    properties: {
      id: {
        type: 'string',
        description: 'Unique order identifier',
        example: '64f5e8b12345abcd67890129'
      },
      orderNumber: {
        type: 'string',
        description: 'Human-readable order number',
        example: 'ORD-2024-001'
      },
      userId: {
        type: 'string',
        description: 'User ID (for authenticated orders)',
        example: '64f5e8b12345abcd67890123'
      },
      status: {
        type: 'string',
        enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
        description: 'Order status',
        example: 'PENDING'
      },
      customerInfo: {
        type: 'object',
        required: ['name', 'email', 'address'],
        properties: {
          name: {
            type: 'string',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          address: {
            type: 'object',
            required: ['street', 'city', 'country'],
            properties: {
              street: {
                type: 'string',
                example: '123 Main St'
              },
              city: {
                type: 'string',
                example: 'New York'
              },
              state: {
                type: 'string',
                example: 'NY'
              },
              zipCode: {
                type: 'string',
                example: '10001'
              },
              country: {
                type: 'string',
                example: 'USA'
              }
            }
          }
        }
      },
      subtotal: {
        type: 'number',
        format: 'float',
        description: 'Order subtotal before discounts',
        example: 59.97
      },
      discount: {
        type: 'number',
        format: 'float',
        description: 'Total discount applied',
        example: 5.99
      },
      total: {
        type: 'number',
        format: 'float',
        description: 'Final order total',
        example: 53.98
      },
      promo: {
        $ref: '#/components/schemas/Promo'
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/OrderItem'
        }
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
  
  // Order Item Schema
  OrderItem: {
    type: 'object',
    required: ['id', 'quantity', 'unitPrice', 'totalPrice', 'productName', 'variantName'],
    properties: {
      id: {
        type: 'string',
        description: 'Order item identifier',
        example: '64f5e8b12345abcd67890130'
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        description: 'Quantity ordered',
        example: 2
      },
      unitPrice: {
        type: 'number',
        format: 'float',
        description: 'Price per unit at time of order',
        example: 19.99
      },
      totalPrice: {
        type: 'number',
        format: 'float',
        description: 'Total price for this item',
        example: 39.98
      },
      productName: {
        type: 'string',
        description: 'Product name at time of order',
        example: 'Classic T-Shirt'
      },
      variantName: {
        type: 'string',
        description: 'Variant name at time of order',
        example: 'Medium - Black'
      },
      productId: {
        type: 'string',
        description: 'Reference to product',
        example: '64f5e8b12345abcd67890124'
      },
      variantId: {
        type: 'string',
        description: 'Reference to variant',
        example: '64f5e8b12345abcd67890125'
      }
    }
  },
  
  // Request Schemas
  CreateOrderRequest: {
    type: 'object',
    required: ['customerInfo'],
    properties: {
      customerInfo: {
        type: 'object',
        required: ['name', 'email', 'address'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Customer full name',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Customer email address',
            example: 'john@example.com'
          },
          phone: {
            type: 'string',
            description: 'Customer phone number (optional)',
            example: '+1234567890'
          },
          address: {
            type: 'object',
            required: ['street', 'city', 'country'],
            properties: {
              street: {
                type: 'string',
                minLength: 1,
                maxLength: 200,
                description: 'Street address',
                example: '123 Main St, Apt 4B'
              },
              city: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'City',
                example: 'New York'
              },
              state: {
                type: 'string',
                maxLength: 50,
                description: 'State/Province (optional)',
                example: 'NY'
              },
              zipCode: {
                type: 'string',
                maxLength: 20,
                description: 'ZIP/Postal code (optional)',
                example: '10001'
              },
              country: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Country',
                example: 'USA'
              }
            }
          }
        }
      },
      promoCode: {
        type: 'string',
        description: 'Optional promo code to apply',
        example: 'WELCOME10'
      }
    }
  },
  
  UpdateOrderStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
        description: 'New order status',
        example: 'SHIPPED'
      }
    }
  },
  
  // Response Schemas
  OrderList: {
    type: 'object',
    required: ['orders', 'pagination'],
    properties: {
      orders: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Order'
        }
      },
      pagination: {
        $ref: '#/components/schemas/Pagination'
      }
    }
  },
  
  OrderAnalytics: {
    type: 'object',
    properties: {
      totalOrders: {
        type: 'integer',
        description: 'Total number of orders',
        example: 150
      },
      totalRevenue: {
        type: 'number',
        format: 'float',
        description: 'Total revenue from all orders',
        example: 15420.50
      },
      averageOrderValue: {
        type: 'number',
        format: 'float',
        description: 'Average order value',
        example: 102.80
      },
      statusBreakdown: {
        type: 'object',
        description: 'Order count by status',
        properties: {
          PENDING: { type: 'integer', example: 25 },
          CONFIRMED: { type: 'integer', example: 30 },
          PROCESSING: { type: 'integer', example: 20 },
          SHIPPED: { type: 'integer', example: 45 },
          DELIVERED: { type: 'integer', example: 28 },
          CANCELLED: { type: 'integer', example: 2 }
        }
      },
      recentOrders: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Order'
        }
      }
    }
  }
};
