import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import productRoutes from './routes/products';
import cartRoutes from './routes/carts';
import promoRoutes from './routes/promos';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';

dotenv.config();

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'A comprehensive headless e-commerce backend with step-by-step workflow guidance.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Users',
        description: '👤 **Step 1**: User management - Create and manage user accounts (optional for guest checkout)',
      },
      {
        name: 'Products',
        description: '📦 **Step 2**: Product catalog - Browse products, variants, and search the catalog',
      },
      {
        name: 'Carts',
        description: '🛍️ **Step 3**: Shopping cart - Manage guest carts, add/remove items, update quantities',
      },
      {
        name: 'Promos',
        description: '🎫 **Step 4**: Promotions - Browse and validate discount codes (optional)',
      },
      {
        name: 'Orders',
        description: '📋 **Step 5**: Order management - Create orders, apply promos, track order status',
      },
    ],
    components: {
      schemas: {
        // Core Error Schemas
        Error: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: {
              type: 'string',
              description: 'Error type or code',
              example: 'VALIDATION_ERROR'
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
              example: 'Invalid email format'
            },
            details: {
              type: 'object',
              description: 'Additional error details',
              example: {
                field: 'email',
                code: 'invalid_format'
              }
            }
          }
        },
        ValidationError: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: {
              type: 'string',
              example: 'VALIDATION_ERROR'
            },
            message: {
              type: 'string',
              example: 'body.email: Invalid email format'
            }
          }
        },
        SuccessMessage: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        },
        
        // Step 1: User Schemas
        User: {
          type: 'object',
          required: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
              example: '64f5e8b12345abcd67890123'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email (unique)',
              example: 'john@example.com'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
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
        CreateUserRequest: {
          type: 'object',
          required: ['email', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email (must be unique)',
              example: 'john@example.com'
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'User full name',
              example: 'John Doe'
            }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          minProperties: 1,
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'New email (must be unique if provided)',
              example: 'john.smith@example.com'
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'New full name',
              example: 'John Smith'
            }
          }
        },
        UserList: {
          type: 'object',
          required: ['users', 'pagination'],
          properties: {
            users: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              }
            },
            pagination: {
              type: 'object',
              required: ['page', 'limit', 'total', 'totalPages'],
              properties: {
                page: {
                  type: 'integer',
                  minimum: 1,
                  example: 1
                },
                limit: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  example: 10
                },
                total: {
                  type: 'integer',
                  minimum: 0,
                  example: 25
                },
                totalPages: {
                  type: 'integer',
                  minimum: 0,
                  example: 3
                }
              }
            }
          }
        },
        
        // Step 2: Product Schemas
        Product: {
          type: 'object',
          required: ['id', 'name', 'slug', 'category', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique product identifier',
              example: '64f5e8b12345abcd67890124'
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Classic T-Shirt'
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'A comfortable cotton t-shirt'
            },
            slug: {
              type: 'string',
              description: 'URL-friendly product identifier',
              example: 'classic-t-shirt'
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Clothing'
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              description: 'Product image URLs',
              example: ['https://example.com/image1.jpg']
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              example: 'ACTIVE'
            },
            variants: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ProductVariant'
              }
            }
          }
        },
        ProductVariant: {
          type: 'object',
          required: ['id', 'name', 'sku', 'price', 'inventory'],
          properties: {
            id: {
              type: 'string',
              example: '64f5e8b12345abcd67890125'
            },
            name: {
              type: 'string',
              description: 'Variant name (size, color, etc.)',
              example: 'Medium - Black'
            },
            sku: {
              type: 'string',
              description: 'Stock keeping unit',
              example: 'TSH-BLK-M'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Variant price',
              example: 19.99
            },
            inventory: {
              type: 'integer',
              description: 'Available stock',
              example: 75
            },
            attributes: {
              type: 'object',
              description: 'Variant attributes',
              example: { size: 'M', color: 'Black' }
            }
          }
        },
        
        // Step 3: Cart Schemas
        Cart: {
          type: 'object',
          required: ['id', 'guestToken', 'items', 'itemCount', 'subtotal'],
          properties: {
            id: {
              type: 'string',
              example: '64f5e8b12345abcd67890126'
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
            }
          }
        },
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
            }
          }
        },
        
        // Step 4: Promo Schemas
        Promo: {
          type: 'object',
          required: ['id', 'code', 'name', 'type', 'value', 'status'],
          properties: {
            id: {
              type: 'string',
              example: '64f5e8b12345abcd67890128'
            },
            code: {
              type: 'string',
              description: 'Promo code to apply',
              example: 'WELCOME10'
            },
            name: {
              type: 'string',
              description: 'Promo display name',
              example: 'Welcome Discount'
            },
            description: {
              type: 'string',
              description: 'Promo description',
              example: '10% off your first order'
            },
            type: {
              type: 'string',
              enum: ['PERCENTAGE', 'FIXED'],
              description: 'Discount type',
              example: 'PERCENTAGE'
            },
            value: {
              type: 'number',
              format: 'float',
              description: 'Discount value (percentage or fixed amount)',
              example: 10
            },
            minAmount: {
              type: 'number',
              format: 'float',
              description: 'Minimum order amount required',
              example: 50
            },
            maxDiscount: {
              type: 'number',
              format: 'float',
              description: 'Maximum discount amount (for percentage promos)',
              example: 20
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
              example: 'ACTIVE'
            },
            validFrom: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z'
            },
            validTo: {
              type: 'string',
              format: 'date-time',
              example: '2024-12-31T23:59:59.000Z'
            }
          }
        },
        
        // Step 5: Order Schemas
        Order: {
          type: 'object',
          required: ['id', 'orderNumber', 'status', 'subtotal', 'total', 'items'],
          properties: {
            id: {
              type: 'string',
              example: '64f5e8b12345abcd67890129'
            },
            orderNumber: {
              type: 'string',
              description: 'Human-readable order number',
              example: 'ORD-2024-001'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
              example: 'PENDING'
            },
            subtotal: {
              type: 'number',
              format: 'float',
              description: 'Order subtotal before discounts',
              example: 59.97
            },
            discountAmount: {
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
            appliedPromo: {
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
            }
          }
        },
        OrderItem: {
          type: 'object',
          required: ['id', 'quantity', 'price', 'product', 'variant'],
          properties: {
            id: {
              type: 'string',
              example: '64f5e8b12345abcd67890130'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              example: 2
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Price at time of order',
              example: 19.99
            },
            product: {
              $ref: '#/components/schemas/Product'
            },
            variant: {
              $ref: '#/components/schemas/ProductVariant'
            }
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'JWT token for guest cart management. Get this token from GET /api/carts endpoint.'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;
