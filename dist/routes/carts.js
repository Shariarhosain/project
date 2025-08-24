"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartService_1 = __importDefault(require("../services/cartService"));
const validation_1 = require("../middleware/validation");
const validation_2 = require("../schemas/validation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.guestOrAuth, auth_1.ensureGuestToken, async (req, res, next) => {
    try {
        let cart;
        if (req.user) {
            cart = await cartService_1.default.getOrCreateCart(undefined, req.user.id);
        }
        else {
            cart = await cartService_1.default.getOrCreateCart(req.guestToken);
        }
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
router.post('/items', auth_1.guestOrAuth, auth_1.ensureGuestToken, (0, validation_1.validate)(validation_2.addToCartSchema), async (req, res, next) => {
    try {
        let cart;
        if (req.user) {
            cart = await cartService_1.default.addToCart(undefined, req.body, req.user.id);
        }
        else {
            cart = await cartService_1.default.addToCart(req.guestToken, req.body);
        }
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
router.put('/items/:itemId', auth_1.guestOrAuth, auth_1.ensureGuestToken, (0, validation_1.validate)(validation_2.updateCartItemSchema), async (req, res, next) => {
    try {
        const tokenToUse = req.user ? `user:${req.user.id}` : req.guestToken;
        const cart = await cartService_1.default.updateCartItem(tokenToUse, req.params.itemId, req.body);
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/items/:itemId', auth_1.guestOrAuth, auth_1.ensureGuestToken, async (req, res, next) => {
    try {
        const tokenToUse = req.user ? `user:${req.user.id}` : req.guestToken;
        const cart = await cartService_1.default.removeCartItem(tokenToUse, req.params.itemId);
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
router.post('/clear', auth_1.guestOrAuth, auth_1.ensureGuestToken, async (req, res, next) => {
    try {
        const tokenToUse = req.user ? `user:${req.user.id}` : req.guestToken;
        const cart = await cartService_1.default.clearCart(tokenToUse);
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=carts.js.map