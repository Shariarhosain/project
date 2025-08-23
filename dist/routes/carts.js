"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartService_1 = __importDefault(require("../services/cartService"));
const validation_1 = require("../middleware/validation");
const validation_2 = require("../schemas/validation");
const auth_1 = require("../utils/auth");
const auth_2 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.get('/', auth_2.optionalAuth, async (req, res, next) => {
    try {
        let cart;
        if (req.user) {
            cart = await cartService_1.default.getOrCreateCart(undefined, req.user.id);
        }
        else {
            const guestToken = (0, auth_1.extractGuestToken)(req.headers.authorization);
            cart = await cartService_1.default.getOrCreateCart(guestToken || undefined);
        }
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
router.post('/items', (0, validation_1.validate)(validation_2.addToCartSchema), async (req, res, next) => {
    try {
        let guestToken = (0, auth_1.extractGuestToken)(req.headers.authorization);
        if (!guestToken) {
            const newCart = await cartService_1.default.getOrCreateCart();
            guestToken = newCart.guestToken;
        }
        const cart = await cartService_1.default.addToCart(guestToken, req.body);
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
router.put('/items/:itemId', (0, validation_1.validate)(validation_2.updateCartItemSchema), async (req, res, next) => {
    try {
        const guestToken = (0, auth_1.extractGuestToken)(req.headers.authorization);
        if (!guestToken) {
            throw (0, errorHandler_1.createError)('Guest token is required', 401);
        }
        const cart = await cartService_1.default.updateCartItem(guestToken, req.params.itemId, req.body);
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/items/:itemId', async (req, res, next) => {
    try {
        const guestToken = (0, auth_1.extractGuestToken)(req.headers.authorization);
        if (!guestToken) {
            throw (0, errorHandler_1.createError)('Guest token is required', 401);
        }
        const cart = await cartService_1.default.removeCartItem(guestToken, req.params.itemId);
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
router.post('/clear', async (req, res, next) => {
    try {
        const guestToken = (0, auth_1.extractGuestToken)(req.headers.authorization);
        if (!guestToken) {
            throw (0, errorHandler_1.createError)('Guest token is required', 401);
        }
        const cart = await cartService_1.default.clearCart(guestToken);
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=carts.js.map