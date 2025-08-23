"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSwaggerSpec = exports.swaggerOptions = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const userSchemas_1 = require("./schemas/userSchemas");
const productSchemas_1 = require("./schemas/productSchemas");
const cartSchemas_1 = require("./schemas/cartSchemas");
const promoSchemas_1 = require("./schemas/promoSchemas");
const orderSchemas_1 = require("./schemas/orderSchemas");
const commonSchemas_1 = require("./schemas/commonSchemas");
const security_1 = require("./components/security");
exports.swaggerOptions = {
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
        ],
        tags: [
            {
                name: '01 🔐 Authentication',
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
            securitySchemes: security_1.securitySchemes,
            schemas: {
                ...commonSchemas_1.commonSchemas,
                ...userSchemas_1.userSchemas,
                ...productSchemas_1.productSchemas,
                ...cartSchemas_1.cartSchemas,
                ...promoSchemas_1.promoSchemas,
                ...orderSchemas_1.orderSchemas,
            }
        },
        security: [
            {
                BearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts'],
};
const generateSwaggerSpec = () => {
    return (0, swagger_jsdoc_1.default)(exports.swaggerOptions);
};
exports.generateSwaggerSpec = generateSwaggerSpec;
//# sourceMappingURL=swagger.config.js.map