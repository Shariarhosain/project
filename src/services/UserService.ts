import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createError } from '../middleware/errorHandler';
import { generateJWT } from '../utils/auth';
import cartService from './cartService';

const prisma = new PrismaClient();

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

export class UserService {
  async getUsers(params: GetUsersParams) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
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
    } catch (error) {
      console.error('Error fetching users:', error);
      throw createError('Failed to fetch users', 500);
    }
  }

  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Error fetching user:', error);
      throw createError('Failed to fetch user', 500);
    }
  }

  async createUser(data: CreateUserData) {
    try {
      // Check if user with email already exists using findFirst
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Use simple Prisma create - no unique constraint means no transactions needed
      const user = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Error creating user:', error);
      throw createError('Failed to create user', 500);
    }
  }

  async updateUser(id: string, data: UpdateUserData) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw createError('User not found', 404);
      }

      // If email is being updated, check if it's already taken by another user
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await prisma.user.findFirst({
          where: { 
            email: data.email,
            NOT: { id: id }
          },
        });

        if (emailExists) {
          throw createError('Email already exists for another user', 409);
        }
      }

      // Use Prisma update
      const user = await prisma.user.update({
        where: { id },
        data,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Error updating user:', error);
      throw createError('Failed to update user', 500);
    }
  }

  async deleteUser(id: string) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw createError('User not found', 404);
      }

      // Use Prisma delete
      await prisma.user.delete({
        where: { id },
      });

      return { message: 'User deleted successfully' };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Error deleting user:', error);
      throw createError('Failed to delete user', 500);
    }
  }

  async login(email: string, password: string) {
    try {
      // Find user by email
      const user = await prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw createError('Invalid email or password', 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401);
      }

      // Generate JWT token
      const token = generateJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as 'admin' | 'user'
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        message: 'Login successful',
        token,
        user: userWithoutPassword
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Error during login:', error);
      throw createError('Login failed', 500);
    }
  }

  async register(data: RegisterUserData) {
    try {
      // Check if user with email already exists
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create user with default USER role
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'USER', // Default role for new registrations
        },
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        message: 'User registered successfully',
        user: userWithoutPassword
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Error during registration:', error);
      throw createError('Registration failed', 500);
    }
  }

  /**
   * Register a new user and transfer guest cart items
   */
  async registerWithGuestCart(data: RegisterUserData, guestToken?: string) {
    try {
      // Check if user with email already exists
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create user with default USER role
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'USER', // Default role for new registrations
        },
      });

      // Transfer guest cart if provided
      let transferredCart = null;
      if (guestToken) {
        try {
          transferredCart = await cartService.transferGuestCartToUser(guestToken, user.id);
        } catch (error) {
          console.warn('Failed to transfer guest cart:', error);
          // Don't fail registration if cart transfer fails
        }
      }

      // Generate JWT token
      const token = generateJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as 'user' | 'admin',
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        message: 'User registered successfully' + (transferredCart ? ' and cart items transferred' : ''),
        user: userWithoutPassword,
        token,
        cart: transferredCart,
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Error during registration with cart transfer:', error);
      throw createError('Registration failed', 500);
    }
  }

  /**
   * Login user and transfer guest cart if provided
   */
  async loginWithGuestCart(email: string, password: string, guestToken?: string) {
    try {
      const loginResult = await this.login(email, password);
      
      // Transfer guest cart if provided
      let transferredCart = null;
      if (guestToken && loginResult.user) {
        try {
          transferredCart = await cartService.transferGuestCartToUser(guestToken, loginResult.user.id);
        } catch (error) {
          console.warn('Failed to transfer guest cart during login:', error);
          // Don't fail login if cart transfer fails
        }
      }

      return {
        ...loginResult,
        cart: transferredCart,
        message: loginResult.message + (transferredCart ? ' and cart items transferred' : ''),
      };
    } catch (error: any) {
      throw error;
    }
  }

  async loginUser(email: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Generate JWT token
      const token = generateJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as 'admin' | 'user'
      });

      return {
        token,
        user
      };
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      console.error('Error logging in user:', error);
      throw createError('Failed to login user', 500);
    }
  }
}

export default new UserService();