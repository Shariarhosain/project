"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderService_1 = __importDefault(require("../services/orderService"));
const validation_1 = require("../middleware/validation");
const validation_2 = require("../schemas/validation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticateToken, auth_1.requireUser, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const user = req.user;
        const result = await orderService_1.default.getOrders({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            userId: user.role === 'admin' ? undefined : user.id,
            isAdmin: user.role === 'admin'
        });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.guestOrAuth, auth_1.ensureGuestToken, (0, validation_1.validate)(validation_2.createOrderSchema), async (req, res, next) => {
    try {
        const { user, guestToken, isGuest } = req;
        const isUserOrder = !!user;
        const userIdOrGuestToken = isUserOrder ? user.id : guestToken;
        const order = await orderService_1.default.createOrderForGuestOrUser(userIdOrGuestToken, req.body, isUserOrder);
        let message = 'Order created successfully';
        if (order.accountCreated) {
            message += ' and account created';
        }
        res.status(201).json({
            message,
            ...order
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/number/:orderNumber', auth_1.optionalAuth, async (req, res, next) => {
    try {
        const { orderNumber } = req.params;
        const user = req.user;
        const order = await orderService_1.default.getOrderByNumber(orderNumber, user?.id);
        res.json(order);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.authenticateToken, auth_1.requireUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const order = await orderService_1.default.getOrderById(id, user.role === 'admin' ? undefined : user.id);
        res.json(order);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const order = await orderService_1.default.updateOrderStatus(id, status, notes);
        res.json(order);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const order = await orderService_1.default.getOrderById(req.params.id);
        res.json(order);
    }
    catch (error) {
        next(error);
    }
});
router.get('/number/:orderNumber', async (req, res, next) => {
    try {
        const order = await orderService_1.default.getOrderByNumber(req.params.orderNumber);
        res.json(order);
    }
    catch (error) {
        next(error);
    }
});
router.get('/analytics', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const analytics = await orderService_1.default.getOrderAnalytics(startDate, endDate);
        res.json(analytics);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map