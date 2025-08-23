/**
 * Security Schemes
 * Authentication and authorization configurations
 */

export const securitySchemes = {
  BearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT token obtained from login endpoint. Format: Bearer <token>'
  },
  
  GuestToken: {
    type: 'http',
    scheme: 'bearer',
    description: 'Auto-generated UUID token for guest users. No registration required. Format: Bearer <guest-uuid>'
  }
};
