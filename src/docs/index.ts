/**
 * Documentation Index
 * Central export point for all documentation modules
 */

// Re-export all schema modules
export { commonSchemas } from './schemas/commonSchemas';
export { userSchemas } from './schemas/userSchemas';
export { productSchemas } from './schemas/productSchemas';
export { cartSchemas } from './schemas/cartSchemas';
export { promoSchemas } from './schemas/promoSchemas';
export { orderSchemas } from './schemas/orderSchemas';

// Re-export components
export { securitySchemes } from './components/security';

// Re-export main configuration
export { swaggerOptions, generateSwaggerSpec } from './swagger.config';
