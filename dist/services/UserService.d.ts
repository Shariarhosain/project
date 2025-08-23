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
export {};
//# sourceMappingURL=UserService.d.ts.map