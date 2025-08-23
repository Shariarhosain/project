"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserService_1 = require("../services/UserService");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = express_1.default.Router();
const userService = new UserService_1.UserService();
const createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long'),
        role: zod_1.z.enum(['USER', 'ADMIN']).optional(),
    }),
});
const updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format').optional(),
        name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
        role: zod_1.z.enum(['USER', 'ADMIN']).optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update"
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'User ID is required'),
    }),
});
const getUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'User ID is required'),
    }),
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long'),
    }),
});
router.post('/login', (0, validation_1.validate)(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await userService.login(email, password);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/register', (0, validation_1.validate)(registerSchema), async (req, res, next) => {
    try {
        const result = await userService.register(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const search = req.query.search;
        const result = await userService.getUsers({ page, limit, search });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', (0, validation_1.validate)(getUserSchema), async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
router.get('/profile', auth_1.authenticateToken, auth_1.requireUser, async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.user.id);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireUser, (0, validation_1.validate)(updateUserSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
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
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validate)(getUserSchema), async (req, res, next) => {
    try {
        const result = await userService.deleteUser(req.params.id);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map