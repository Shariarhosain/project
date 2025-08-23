export declare const orderSchemas: {
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
};
//# sourceMappingURL=orderSchemas.d.ts.map