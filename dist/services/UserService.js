"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../utils/auth");
const prisma = new client_1.PrismaClient();
class UserService {
    async getUsers(params) {
        const { page, limit, search } = params;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        try {
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                }),
                prisma.user.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            console.error('Error fetching users:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch users', 500);
        }
    }
    async getUserById(id) {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            console.error('Error fetching user:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch user', 500);
        }
    }
    async createUser(data) {
        try {
            const existingUser = await prisma.user.findFirst({
                where: { email: data.email },
            });
            if (existingUser) {
                throw (0, errorHandler_1.createError)('User with this email already exists', 409);
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(data.password, saltRounds);
            const user = await prisma.user.create({
                data: {
                    ...data,
                    password: hashedPassword,
                },
            });
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            console.error('Error creating user:', error);
            throw (0, errorHandler_1.createError)('Failed to create user', 500);
        }
    }
    async updateUser(id, data) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            if (data.email && data.email !== existingUser.email) {
                const emailExists = await prisma.user.findFirst({
                    where: {
                        email: data.email,
                        NOT: { id: id }
                    },
                });
                if (emailExists) {
                    throw (0, errorHandler_1.createError)('Email already exists for another user', 409);
                }
            }
            const user = await prisma.user.update({
                where: { id },
                data,
            });
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            console.error('Error updating user:', error);
            throw (0, errorHandler_1.createError)('Failed to update user', 500);
        }
    }
    async deleteUser(id) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            await prisma.user.delete({
                where: { id },
            });
            return { message: 'User deleted successfully' };
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            console.error('Error deleting user:', error);
            throw (0, errorHandler_1.createError)('Failed to delete user', 500);
        }
    }
    async login(email, password) {
        try {
            const user = await prisma.user.findFirst({
                where: { email },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('Invalid email or password', 401);
            }
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw (0, errorHandler_1.createError)('Invalid email or password', 401);
            }
            const token = (0, auth_1.generateJWT)({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.toLowerCase()
            });
            const { password: _, ...userWithoutPassword } = user;
            return {
                message: 'Login successful',
                token,
                user: userWithoutPassword
            };
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            console.error('Error during login:', error);
            throw (0, errorHandler_1.createError)('Login failed', 500);
        }
    }
    async register(data) {
        try {
            const existingUser = await prisma.user.findFirst({
                where: { email: data.email },
            });
            if (existingUser) {
                throw (0, errorHandler_1.createError)('User with this email already exists', 409);
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(data.password, saltRounds);
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    name: data.name,
                    role: 'USER',
                },
            });
            const { password: _, ...userWithoutPassword } = user;
            return {
                message: 'User registered successfully',
                user: userWithoutPassword
            };
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            console.error('Error during registration:', error);
            throw (0, errorHandler_1.createError)('Registration failed', 500);
        }
    }
    async loginUser(email) {
        try {
            const user = await prisma.user.findFirst({
                where: { email },
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            const token = (0, auth_1.generateJWT)({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.toLowerCase()
            });
            return {
                token,
                user
            };
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            console.error('Error logging in user:', error);
            throw (0, errorHandler_1.createError)('Failed to login user', 500);
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map