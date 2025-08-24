interface CreateUserData {
    email: string;
    password: string;
    name: string;
    role?: 'USER' | 'ADMIN';
}
interface RegisterUserData {
    email: string;
    password: string;
    name: string;
}
interface UpdateUserData {
    email?: string;
    name?: string;
    role?: 'USER' | 'ADMIN';
}
interface GetUsersParams {
    page: number;
    limit: number;
    search?: string;
}
export declare class UserService {
    getUsers(params: GetUsersParams): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createUser(data: CreateUserData): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: string, data: UpdateUserData): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    login(email: string, password: string): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    register(data: RegisterUserData): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    registerWithGuestCart(data: RegisterUserData, guestToken?: string): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
        };
        token: string;
        cart: ({
            items: ({
                product: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    category: string;
                    status: import(".prisma/client").$Enums.ProductStatus;
                    description: string | null;
                    images: string[];
                };
                variant: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    sku: string;
                    price: number;
                    inventory: number;
                    attributes: import("@prisma/client/runtime/library").JsonValue | null;
                    productId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                variantId: string;
                productId: string;
                cartId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            promoCode: string | null;
            guestToken: string | null;
            userId: string | null;
            promoId: string | null;
            discount: number;
            expiresAt: Date;
        }) | null;
    }>;
    loginWithGuestCart(email: string, password: string, guestToken?: string): Promise<{
        cart: ({
            items: ({
                product: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    category: string;
                    status: import(".prisma/client").$Enums.ProductStatus;
                    description: string | null;
                    images: string[];
                };
                variant: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    sku: string;
                    price: number;
                    inventory: number;
                    attributes: import("@prisma/client/runtime/library").JsonValue | null;
                    productId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                quantity: number;
                variantId: string;
                productId: string;
                cartId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            promoCode: string | null;
            guestToken: string | null;
            userId: string | null;
            promoId: string | null;
            discount: number;
            expiresAt: Date;
        }) | null;
        message: string;
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    loginUser(email: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
            password: string;
        };
    }>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=UserService.d.ts.map