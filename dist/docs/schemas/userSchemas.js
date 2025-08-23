"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchemas = void 0;
exports.userSchemas = {
    User: {
        type: 'object',
        required: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'],
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
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN'],
                description: 'User role - USER (default) or ADMIN',
                example: 'USER'
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
    AuthResponse: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
                example: 'Login successful'
            },
            token: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '64f5e8b12345abcd67890123'
                    },
                    email: {
                        type: 'string',
                        example: 'admin@example.com'
                    },
                    name: {
                        type: 'string',
                        example: 'Admin User'
                    },
                    role: {
                        type: 'string',
                        enum: ['USER', 'ADMIN'],
                        example: 'ADMIN'
                    }
                }
            }
        }
    },
    CreateUserRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                description: 'User email (must be unique)',
                example: 'john@example.com'
            },
            password: {
                type: 'string',
                minLength: 6,
                description: 'User password (minimum 6 characters)',
                example: 'password123'
            },
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'User full name',
                example: 'John Doe'
            },
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN'],
                description: 'User role (optional, defaults to USER)',
                example: 'USER'
            }
        }
    },
    LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                description: 'User email for login',
                example: 'john@example.com'
            },
            password: {
                type: 'string',
                description: 'User password',
                example: 'password123'
            }
        }
    },
    LoginResponse: {
        type: 'object',
        required: ['token', 'user'],
        properties: {
            token: {
                type: 'string',
                description: 'JWT token for authentication',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
                $ref: '#/components/schemas/User'
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
            },
            role: {
                type: 'string',
                enum: ['USER', 'ADMIN'],
                description: 'User role (admin only)',
                example: 'USER'
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
                $ref: '#/components/schemas/Pagination'
            }
        }
    }
};
//# sourceMappingURL=userSchemas.js.map