export declare const swaggerOptions: {
    definition: {
        openapi: string;
        info: {
            title: string;
            version: string;
            description: string;
            contact: {
                name: string;
                email: string;
            };
        };
        servers: {
            url: string;
            description: string;
        }[];
        tags: {
            name: string;
            description: string;
        }[];
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: string;
                    scheme: string;
                    bearerFormat: string;
                    description: string;
                };
                GuestToken: {
                    type: string;
                    scheme: string;
                    description: string;
                };
            };
            schemas: {
                Order: {
                    type: string;
                    required: string[];
                    properties: {
                        id: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        orderNumber: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        userId: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        status: {
                            type: string;
                            enum: string[];
                            description: string;
                            example: string;
                        };
                        customerInfo: {
                            type: string;
                            required: string[];
                            properties: {
                                name: {
                                    type: string;
                                    example: string;
                                };
                                email: {
                                    type: string;
                                    format: string;
                                    example: string;
                                };
                                phone: {
                                    type: string;
                                    example: string;
                                };
                                address: {
                                    type: string;
                                    required: string[];
                                    properties: {
                                        street: {
                                            type: string;
                                            example: string;
                                        };
                                        city: {
                                            type: string;
                                            example: string;
                                        };
                                        state: {
                                            type: string;
                                            example: string;
                                        };
                                        zipCode: {
                                            type: string;
                                            example: string;
                                        };
                                        country: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                        subtotal: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        discount: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        total: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        promo: {
                            $ref: string;
                        };
                        items: {
                            type: string;
                            items: {
                                $ref: string;
                            };
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
                OrderItem: {
                    type: string;
                    required: string[];
                    properties: {
                        id: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        quantity: {
                            type: string;
                            minimum: number;
                            description: string;
                            example: number;
                        };
                        unitPrice: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        totalPrice: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        productName: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        variantName: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        productId: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        variantId: {
                            type: string;
                            description: string;
                            example: string;
                        };
                    };
                };
                CreateOrderRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        customerInfo: {
                            type: string;
                            required: string[];
                            properties: {
                                name: {
                                    type: string;
                                    minLength: number;
                                    maxLength: number;
                                    description: string;
                                    example: string;
                                };
                                email: {
                                    type: string;
                                    format: string;
                                    description: string;
                                    example: string;
                                };
                                phone: {
                                    type: string;
                                    description: string;
                                    example: string;
                                };
                                address: {
                                    type: string;
                                    required: string[];
                                    properties: {
                                        street: {
                                            type: string;
                                            minLength: number;
                                            maxLength: number;
                                            description: string;
                                            example: string;
                                        };
                                        city: {
                                            type: string;
                                            minLength: number;
                                            maxLength: number;
                                            description: string;
                                            example: string;
                                        };
                                        state: {
                                            type: string;
                                            maxLength: number;
                                            description: string;
                                            example: string;
                                        };
                                        zipCode: {
                                            type: string;
                                            maxLength: number;
                                            description: string;
                                            example: string;
                                        };
                                        country: {
                                            type: string;
                                            minLength: number;
                                            maxLength: number;
                                            description: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                        promoCode: {
                            type: string;
                            description: string;
                            example: string;
                        };
                    };
                };
                UpdateOrderStatusRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                            description: string;
                            example: string;
                        };
                    };
                };
                OrderList: {
                    type: string;
                    required: string[];
                    properties: {
                        orders: {
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
                OrderAnalytics: {
                    type: string;
                    properties: {
                        totalOrders: {
                            type: string;
                            description: string;
                            example: number;
                        };
                        totalRevenue: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        averageOrderValue: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        statusBreakdown: {
                            type: string;
                            description: string;
                            properties: {
                                PENDING: {
                                    type: string;
                                    example: number;
                                };
                                CONFIRMED: {
                                    type: string;
                                    example: number;
                                };
                                PROCESSING: {
                                    type: string;
                                    example: number;
                                };
                                SHIPPED: {
                                    type: string;
                                    example: number;
                                };
                                DELIVERED: {
                                    type: string;
                                    example: number;
                                };
                                CANCELLED: {
                                    type: string;
                                    example: number;
                                };
                            };
                        };
                        recentOrders: {
                            type: string;
                            items: {
                                $ref: string;
                            };
                        };
                    };
                };
                Promo: {
                    type: string;
                    required: string[];
                    properties: {
                        id: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        code: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        name: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        description: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        type: {
                            type: string;
                            enum: string[];
                            description: string;
                            example: string;
                        };
                        value: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        minAmount: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        maxDiscount: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        status: {
                            type: string;
                            enum: string[];
                            example: string;
                        };
                        validFrom: {
                            type: string;
                            format: string;
                            description: string;
                            example: string;
                        };
                        validTo: {
                            type: string;
                            format: string;
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
                CreatePromoRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        code: {
                            type: string;
                            minLength: number;
                            maxLength: number;
                            pattern: string;
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
                        description: {
                            type: string;
                            maxLength: number;
                            description: string;
                            example: string;
                        };
                        type: {
                            type: string;
                            enum: string[];
                            description: string;
                            example: string;
                        };
                        value: {
                            type: string;
                            format: string;
                            minimum: number;
                            description: string;
                            example: number;
                        };
                        minAmount: {
                            type: string;
                            format: string;
                            minimum: number;
                            description: string;
                            example: number;
                        };
                        maxDiscount: {
                            type: string;
                            format: string;
                            minimum: number;
                            description: string;
                            example: number;
                        };
                        validFrom: {
                            type: string;
                            format: string;
                            description: string;
                            example: string;
                        };
                        validTo: {
                            type: string;
                            format: string;
                            description: string;
                            example: string;
                        };
                    };
                };
                ApplyPromoRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        promoCode: {
                            type: string;
                            description: string;
                            example: string;
                        };
                    };
                };
                PromoApplicationResult: {
                    type: string;
                    properties: {
                        valid: {
                            type: string;
                            description: string;
                            example: boolean;
                        };
                        promo: {
                            $ref: string;
                        };
                        discount: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        message: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        error: {
                            type: string;
                            description: string;
                            example: string;
                        };
                    };
                };
                PromoList: {
                    type: string;
                    required: string[];
                    properties: {
                        promos: {
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
                Cart: {
                    type: string;
                    required: string[];
                    properties: {
                        id: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        userId: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        guestToken: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        items: {
                            type: string;
                            items: {
                                $ref: string;
                            };
                        };
                        itemCount: {
                            type: string;
                            description: string;
                            example: number;
                        };
                        subtotal: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
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
                CartItem: {
                    type: string;
                    required: string[];
                    properties: {
                        id: {
                            type: string;
                            example: string;
                        };
                        quantity: {
                            type: string;
                            minimum: number;
                            example: number;
                        };
                        product: {
                            $ref: string;
                        };
                        variant: {
                            $ref: string;
                        };
                        subtotal: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                    };
                };
                AddToCartRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        variantId: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        quantity: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                            example: number;
                        };
                    };
                };
                UpdateCartItemRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        quantity: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                            example: number;
                        };
                    };
                };
                CartResponse: {
                    type: string;
                    properties: {
                        message: {
                            type: string;
                            example: string;
                        };
                        cart: {
                            $ref: string;
                        };
                        guestToken: {
                            type: string;
                            description: string;
                            example: string;
                        };
                    };
                };
                Product: {
                    type: string;
                    required: string[];
                    properties: {
                        id: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        name: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        description: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        slug: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        category: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        images: {
                            type: string;
                            items: {
                                type: string;
                                format: string;
                            };
                            description: string;
                            example: string[];
                        };
                        status: {
                            type: string;
                            enum: string[];
                            example: string;
                        };
                        variants: {
                            type: string;
                            items: {
                                $ref: string;
                            };
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
                ProductVariant: {
                    type: string;
                    required: string[];
                    properties: {
                        id: {
                            type: string;
                            example: string;
                        };
                        name: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        sku: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        price: {
                            type: string;
                            format: string;
                            description: string;
                            example: number;
                        };
                        inventory: {
                            type: string;
                            description: string;
                            example: number;
                        };
                        attributes: {
                            type: string;
                            description: string;
                            example: {
                                size: string;
                                color: string;
                            };
                        };
                    };
                };
                CreateProductRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        name: {
                            type: string;
                            minLength: number;
                            maxLength: number;
                            description: string;
                            example: string;
                        };
                        description: {
                            type: string;
                            maxLength: number;
                            description: string;
                            example: string;
                        };
                        category: {
                            type: string;
                            minLength: number;
                            maxLength: number;
                            description: string;
                            example: string;
                        };
                        images: {
                            type: string;
                            items: {
                                type: string;
                                format: string;
                            };
                            description: string;
                            example: string[];
                        };
                        status: {
                            type: string;
                            enum: string[];
                            description: string;
                            example: string;
                        };
                        variants: {
                            type: string;
                            minItems: number;
                            items: {
                                $ref: string;
                            };
                        };
                    };
                };
                CreateVariantRequest: {
                    type: string;
                    required: string[];
                    properties: {
                        name: {
                            type: string;
                            minLength: number;
                            maxLength: number;
                            description: string;
                            example: string;
                        };
                        sku: {
                            type: string;
                            minLength: number;
                            maxLength: number;
                            description: string;
                            example: string;
                        };
                        price: {
                            type: string;
                            format: string;
                            minimum: number;
                            description: string;
                            example: number;
                        };
                        inventory: {
                            type: string;
                            minimum: number;
                            description: string;
                            example: number;
                        };
                        attributes: {
                            type: string;
                            description: string;
                            example: {
                                size: string;
                                color: string;
                            };
                        };
                    };
                };
                ProductList: {
                    type: string;
                    required: string[];
                    properties: {
                        products: {
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
                Error: {
                    type: string;
                    required: string[];
                    properties: {
                        error: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        message: {
                            type: string;
                            description: string;
                            example: string;
                        };
                        details: {
                            type: string;
                            description: string;
                            example: {
                                field: string;
                                code: string;
                            };
                        };
                    };
                };
                ValidationError: {
                    type: string;
                    required: string[];
                    properties: {
                        error: {
                            type: string;
                            example: string;
                        };
                        message: {
                            type: string;
                            example: string;
                        };
                    };
                };
                SuccessMessage: {
                    type: string;
                    properties: {
                        message: {
                            type: string;
                            example: string;
                        };
                    };
                };
                Pagination: {
                    type: string;
                    required: string[];
                    properties: {
                        page: {
                            type: string;
                            minimum: number;
                            example: number;
                        };
                        limit: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            example: number;
                        };
                        total: {
                            type: string;
                            minimum: number;
                            example: number;
                        };
                        totalPages: {
                            type: string;
                            minimum: number;
                            example: number;
                        };
                    };
                };
            };
        };
        security: {
            BearerAuth: never[];
        }[];
    };
    apis: string[];
};
export declare const generateSwaggerSpec: () => object;
//# sourceMappingURL=swagger.config.d.ts.map