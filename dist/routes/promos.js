"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promoService_1 = __importDefault(require("../services/promoService"));
const validation_1 = require("../middleware/validation");
const validation_2 = require("../schemas/validation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.optionalAuth, (0, validation_1.validate)(validation_2.paginationSchema), async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const isAdmin = req.user && req.user.role === 'admin';
        const result = await promoService_1.default.getPromos(page, limit, isAdmin);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/apply', auth_1.guestOrAuth, auth_1.ensureGuestToken, (0, validation_1.validate)(validation_2.applyPromoSchema), async (req, res, next) => {
    try {
        let guestToken;
        let userId;
        if (req.user) {
            userId = req.user.id;
        }
        else {
            guestToken = req.guestToken;
        }
        const result = await promoService_1.default.applyPromoToCart(guestToken, req.body.promoCode, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/remove', auth_1.guestOrAuth, auth_1.ensureGuestToken, async (req, res, next) => {
    try {
        let guestToken;
        let userId;
        if (req.user) {
            userId = req.user.id;
        }
        else {
            guestToken = req.guestToken;
        }
        const result = await promoService_1.default.removePromoFromCart(guestToken, userId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validate)(validation_2.createPromoSchema), async (req, res, next) => {
    try {
        const promo = await promoService_1.default.createPromo(req.body);
        res.status(201).json(promo);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const promo = await promoService_1.default.getPromoById(req.params.id);
        res.json(promo);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const promo = await promoService_1.default.updatePromo(req.params.id, req.body);
        res.json(promo);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const result = await promoService_1.default.deletePromo(req.params.id);
        res.json({ message: 'Promo deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=promos.js.map