import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

interface CreateUserData {
  email: string;
  name: string;
}

interface UpdateUserData {
  email?: string;
  name?: string;
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

      return user;
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

      // Use simple Prisma create - no unique constraint means no transactions needed
      const user = await prisma.user.create({
        data,
      });

      return user;
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

      return user;
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
}
