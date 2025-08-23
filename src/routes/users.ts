import express from 'express';
import { UserService } from '../services/UserService';
import { validate } from '../middleware/validation';
import { authenticateToken, requireAdmin, requireUser, AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const userService = new UserService();

// Validation schemas
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    role: z.enum(['USER', 'ADMIN']).optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').optional(),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
  }),
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

const getUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  }),
});


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Login successful"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "64f5e8b12345abcd67890123"
 *             email:
 *               type: string
 *               example: "admin@example.com"
 *             name:
 *               type: string
 *               example: "Admin User"
 *             role:
 *               type: string
 *               enum: [USER, ADMIN]
 *               example: "ADMIN"
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 🔐 User Login - Get JWT Token
 *     description: |
 *       **PUBLIC ENDPOINT**: Authenticate user and receive JWT token.
 *       
 *       **How to use the token**:
 *       1. Copy the returned token from the response
 *       2. Click "Authorize" button at the top of this page
 *       3. Enter: `Bearer <your-token>`
 *       4. Now you can test protected endpoints
 *       
 *       **Test Accounts** (use these for testing):
 *       - **Admin**: admin@example.com / admin123
 *       - **User**: john@example.com / john123  
 *       - **User**: jane@example.com / jane123
 *     tags: [01 🔐 Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *                 example: "admin123"
 *           examples:
 *             admin_login:
 *               summary: Admin Login
 *               value:
 *                 email: "admin@example.com"
 *                 password: "admin123"
 *             user_login:
 *               summary: Regular User Login
 *               value:
 *                 email: "john@example.com"
 *                 password: "john123"
 *     responses:
 *       200:
 *         description: ✅ Login successful - Token generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               admin_response:
 *                 summary: Admin login response
 *                 value:
 *                   message: "Login successful"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjVlOGIxMjM0NWFiY2Q2Nzg5MDEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE2OTQ2MjQwMDB9.example"
 *                   user:
 *                     id: "64f5e8b12345abcd67890123"
 *                     email: "admin@example.com"
 *                     name: "Admin User"
 *                     role: "ADMIN"
 *       400:
 *         description: ❌ Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: ❌ Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 *       500:
 *         description: ❌ Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: 📝 User Registration
 *     description: |
 *       **PUBLIC ENDPOINT**: Register a new user account.
 *       
 *       **Default Role**: New users are assigned "USER" role by default.
 *       **Admin Creation**: Only existing admins can create new admin accounts.
 *       
 *       After registration, use the login endpoint to get your JWT token.
 *     tags: [01 🔐 Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "newuser@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (min 6 characters)
 *                 example: "password123"
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: User's full name
 *                 example: "New User"
 *           examples:
 *             new_user:
 *               summary: New User Registration
 *               value:
 *                 email: "newuser@example.com"
 *                 password: "password123"
 *                 name: "New User"
 *     responses:
 *       201:
 *         description: ✅ User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64f5e8b12345abcd67890123"
 *                     email:
 *                       type: string
 *                       example: "newuser@example.com"
 *                     name:
 *                       type: string
 *                       example: "New User"
 *                     role:
 *                       type: string
 *                       example: "USER"
 *       400:
 *         description: ❌ Invalid input data (validation error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               invalid_email:
 *                 summary: Invalid email format
 *                 value:
 *                   error: "VALIDATION_ERROR"
 *                   message: "body.email: Invalid email format"
 *               missing_password:
 *                 summary: Missing password
 *                 value:
 *                   error: "VALIDATION_ERROR"
 *                   message: "body.password: Password is required"
 *               weak_password:
 *                 summary: Password too short
 *                 value:
 *                   error: "VALIDATION_ERROR"
 *                   message: "body.password: Password must be at least 6 characters long"
 *               missing_name:
 *                 summary: Missing name
 *                 value:
 *                   error: "VALIDATION_ERROR"
 *                   message: "body.name: Name is required"
 *       409:
 *         description: ❌ Email already exists - User with this email is already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               email_exists:
 *                 summary: Email already registered
 *                 value:
 *                   error: "CONFLICT"
 *                   message: "User with this email already exists"
 *                   details:
 *                     field: "email"
 *                     code: "already_exists"
 *       500:
 *         description: ❌ Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 📋 Get all users (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Retrieve a paginated list of all users in the system.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **How to get admin token**:
 *       1. Create an admin user with role: "ADMIN" via POST /api/users
 *       2. Login with admin email via POST /api/users/login  
 *       3. Use the returned JWT token
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page (max 100)
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email (case-insensitive)
 *         example: "john"
 *     responses:
 *       200:
 *         description: ✅ Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserList'
 *       401:
 *         description: ❌ Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: ❌ Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: ❌ Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: ❌ Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const search = req.query.search as string;

    const result = await userService.getUsers({ page, limit, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: 👤 View User Profile (User Required)
 *     description: |
 *       **USER REQUIRED**: Get the current authenticated user's profile information.
 *       
 *       **Required**: Valid JWT token in Authorization header
 *       
 *       **How to get token**:
 *       1. Create a user account via POST /api/users
 *       2. Login with your email via POST /api/users/login
 *       3. Use the returned JWT token: `Bearer <your-jwt-token>`
 *       
 *       **Use Cases**:
 *       - View personal account information
 *       - Check user role and permissions
 *       - Display user data in profile section
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: ❌ Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Invalid or expired token"
 *                     status:
 *                       type: integer
 *                       example: 401
 *       500:
 *         description: ❌ Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authenticateToken, requireUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validate(getUserSchema), async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: 📝 Update user profile (User/Admin)
 *     description: |
 *       **USER/ADMIN REQUIRED**: Update user profile information.
 *       
 *       **Access Control**:
 *       - **Users**: Can only update their own profile
 *       - **Admins**: Can update any user's profile including role changes
 *       
 *       **Required**: Valid JWT token in Authorization header
 *       
 *       **How to get token**: Login via POST /api/users/login
 *       
 *       **Role Changes**: Only admins can change user roles
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *         example: "64f5e8b12345abcd67890123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           examples:
 *             update_profile:
 *               summary: Update user profile
 *               value:
 *                 name: "John Updated"
 *                 email: "john.updated@example.com"
 *             admin_role_change:
 *               summary: Admin changing user role
 *               value:
 *                 role: "ADMIN"
 *     responses:
 *       200:
 *         description: ✅ User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: ❌ Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: ❌ Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: ❌ Forbidden - Cannot update other users (non-admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "You can only update your own profile"
 *                     status:
 *                       type: integer
 *                       example: 403
 *       404:
 *         description: ❌ User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: ❌ Email already exists for another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticateToken, requireUser, validate(updateUserSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    // Check if user is trying to update their own profile or if they're an admin
    if (user.id !== id && user.role !== 'admin') {
      res.status(403).json({
        error: {
          message: 'You can only update your own profile',
          status: 403,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    // Only admins can change roles
    if (req.body.role && user.role !== 'admin') {
      res.status(403).json({
        error: {
          message: 'Only admins can change user roles',
          status: 403,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    const updatedUser = await userService.updateUser(id, req.body);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: 🗑️ Delete a user (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Delete a user account from the system.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Warning**: This action is irreversible and will also delete:
 *       - User's cart data
 *       - User's order history
 *       - All associated user data
 *       
 *       **Use Cases**:
 *       - Remove spam/fake accounts
 *       - GDPR compliance (data deletion requests)
 *       - Administrative cleanup
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *         example: "64f5e8b12345abcd67890123"
 *     responses:
 *       200:
 *         description: ✅ User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       401:
 *         description: ❌ Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: ❌ Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ❌ User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: ❌ Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticateToken, requireAdmin, validate(getUserSchema), async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
