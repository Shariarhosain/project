/**
 * Main Swagger Configuration
 * Centralizes API documentation setup and imports all modules
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { userSchemas } from './schemas/userSchemas';
import { productSchemas } from './schemas/productSchemas';
import { cartSchemas } from './schemas/cartSchemas';
import { promoSchemas } from './schemas/promoSchemas';
import { orderSchemas } from './schemas/orderSchemas';
import { commonSchemas } from './schemas/commonSchemas';
import { securitySchemes } from './components/security';

/**
 * Main OpenAPI specification
 */
export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '2.0.0',
      description: `E-commerce Headless Backend API`,
      contact: {
        name: 'API Support',
        email: 'shariarhosain131529@gmail.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
      {
        url: 'https://project-production-75d9.up.railway.app/',
        description: 'Production server',
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: '🔐 **Authentication** - Login, register, and get JWT tokens',
      },
      {
        name: 'Users',
        description: '👤 **User Management** - Account creation, profile management, authentication',
      },
      {
        name: 'Products',
        description: '📦 **Product Catalog** - Browse products, variants, and search (Public & Admin)',
      },
      {
        name: 'Carts',
        description: '🛍️ **Shopping Cart** - Manage guest/user carts, add/remove items',
      },
      {
        name: 'Promos',
        description: '🎫 **Promotions** - Browse and apply discount codes (Public & Admin)',
      },
      {
        name: 'Orders',
        description: '📋 **Order Management** - Place orders, track status, order history',
      },
    ],
    components: {
      securitySchemes,
      schemas: {
        ...commonSchemas,
        ...userSchemas,
        ...productSchemas,
        ...cartSchemas,
        ...promoSchemas,
        ...orderSchemas,
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

/**
 * Generate Swagger specification
 */
export const generateSwaggerSpec = () => {
  return swaggerJsdoc(swaggerOptions);
};
