"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productService_1 = __importDefault(require("../services/productService"));
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const validation_2 = require("../schemas/validation");
const router = express_1.default.Router();
router.get('/', (0, validation_1.validate)(validation_2.productQuerySchema), async (req, res, next) => {
    try {
        const result = await productService_1.default.getProducts(req.query);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validate)(validation_2.createProductSchema), async (req, res, next) => {
    try {
        const product = await productService_1.default.createProduct(req.body);
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const product = await productService_1.default.getProductById(req.params.id);
        res.json(product);
    }
    catch (error) {
        next(error);
    }
});
router.get('/slug/:slug', async (req, res, next) => {
    try {
        const product = await productService_1.default.getProductBySlug(req.params.slug);
        res.json(product);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validate)(validation_2.updateProductSchema), async (req, res, next) => {
    try {
        const product = await productService_1.default.updateProduct(req.params.id, req.body);
        res.json(product);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const result = await productService_1.default.deleteProduct(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map