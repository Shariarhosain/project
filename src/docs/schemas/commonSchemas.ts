/**
 * Common Schemas
 * Shared schemas used across multiple modules
 */

export const commonSchemas = {
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
  
  // Pagination Schema
  Pagination: {
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
};
