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
const upload_1 = require("../middleware/upload");
const multer_1 = __importDefault(require("multer"));
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
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, (req, res, next) => {
    (0, upload_1.uploadImages)(req, res, async (err) => {
        if (err) {
            if (err instanceof multer_1.default.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'FILE_TOO_LARGE',
                        message: 'Image file size must be less than 5MB'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        error: 'TOO_MANY_FILES',
                        message: 'Maximum 10 images allowed per upload'
                    });
                }
            }
            return res.status(400).json({
                error: 'UPLOAD_ERROR',
                message: err.message
            });
        }
        try {
            let variants;
            if (req.body.variants) {
                try {
                    variants = JSON.parse(req.body.variants);
                }
                catch (parseError) {
                    return res.status(400).json({
                        error: 'INVALID_VARIANTS',
                        message: 'Variants must be valid JSON format'
                    });
                }
            }
            let imageUrls = [];
            const files = req.files;
            if (files && files.length > 0) {
                const processedImages = await (0, upload_1.processImages)(files, req);
                imageUrls = processedImages.map(img => img.url);
            }
            const productData = {
                name: req.body.name,
                description: req.body.description,
                slug: req.body.slug,
                category: req.body.category,
                status: (req.body.status || 'ACTIVE'),
                images: imageUrls,
                variants: variants || []
            };
            if (!productData.name || !productData.slug || !productData.category || !productData.variants.length) {
                return res.status(400).json({
                    error: 'MISSING_REQUIRED_FIELDS',
                    message: 'Name, slug, category, and at least one variant are required'
                });
            }
            const product = await productService_1.default.createProduct(productData);
            return res.status(201).json(product);
        }
        catch (error) {
            return next(error);
        }
    });
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
router.post('/upload-image', auth_1.authenticateToken, auth_1.requireAdmin, (req, res, next) => {
    (0, upload_1.uploadImages)(req, res, async (err) => {
        if (err) {
            if (err instanceof multer_1.default.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'FILE_TOO_LARGE',
                        message: 'Image file size must be less than 5MB'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        error: 'TOO_MANY_FILES',
                        message: 'Maximum 10 images allowed per upload'
                    });
                }
            }
            return res.status(400).json({
                error: 'UPLOAD_ERROR',
                message: err.message
            });
        }
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({
                    error: 'NO_FILES',
                    message: 'At least one image file is required'
                });
            }
            const processedImages = await (0, upload_1.processImages)(files, req);
            return res.json({
                message: 'Images uploaded successfully',
                images: processedImages
            });
        }
        catch (error) {
            return next(error);
        }
    });
});
exports.default = router;
//# sourceMappingURL=products.js.map