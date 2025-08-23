export declare const userSchemas: {
    User: {
        type: string;
        required: string[];
        properties: {
            id: {
                type: string;
                description: string;
                example: string;
            };
            email: {
                type: string;
                format: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                description: string;
                example: string;
            };
            role: {
                type: string;
                enum: string[];
                description: string;
                example: string;
            };
            createdAt: {
                type: string;
                format: string;
                example: string;
            };
            updatedAt: {
                type: string;
                format: string;
                example: string;
            };
        };
    };
    AuthResponse: {
        type: string;
        properties: {
            message: {
                type: string;
                example: string;
            };
            token: {
                type: string;
                example: string;
            };
            user: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        example: string;
                    };
                    email: {
                        type: string;
                        example: string;
                    };
                    name: {
                        type: string;
                        example: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                        example: string;
                    };
                };
            };
        };
    };
    CreateUserRequest: {
        type: string;
        required: string[];
        properties: {
            email: {
                type: string;
                format: string;
                description: string;
                example: string;
            };
            password: {
                type: string;
                minLength: number;
                description: string;
                example: string;
            };
            name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
                example: string;
            };
            role: {
                type: string;
                enum: string[];
                description: string;
                example: string;
            };
        };
    };
    LoginRequest: {
        type: string;
        required: string[];
        properties: {
            email: {
                type: string;
                format: string;
                description: string;
                example: string;
            };
            password: {
                type: string;
                description: string;
                example: string;
            };
        };
    };
    LoginResponse: {
        type: string;
        required: string[];
        properties: {
            token: {
                type: string;
                description: string;
                example: string;
            };
            user: {
                $ref: string;
            };
        };
    };
    UpdateUserRequest: {
        type: string;
        minProperties: number;
        properties: {
            email: {
                type: string;
                format: string;
                description: string;
                example: string;
            };
            name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
                example: string;
            };
            role: {
                type: string;
                enum: string[];
                description: string;
                example: string;
            };
        };
    };
    UserList: {
        type: string;
        required: string[];
        properties: {
            users: {
                type: string;
                items: {
                    $ref: string;
                };
            };
            pagination: {
                $ref: string;
            };
        };
    };
};
//# sourceMappingURL=userSchemas.d.ts.map