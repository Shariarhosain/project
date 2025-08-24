"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
class ProductService {
    async createProduct(data) {
        const { variants, ...productData } = data;
        const existingProduct = await prisma_1.prisma.product.findUnique({
            where: { slug: productData.slug },
        });
        if (existingProduct) {
            throw (0, errorHandler_1.createError)('Product with this slug already exists', 409);
        }
        const existingSku = await prisma_1.prisma.productVariant.findFirst({
            where: {
                sku: { in: variants.map(v => v.sku) },
            },
        });
        if (existingSku) {
            throw (0, errorHandler_1.createError)('One or more SKUs already exist', 409);
        }
        return await prisma_1.prisma.product.create({
            data: {
                ...productData,
                variants: {
                    create: variants,
                },
            },
            include: {
                variants: true,
            },
        });
    }
    async getProducts(query) {
        const { page = 1, limit = 10, category, status, search } = query;
        const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
        const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (category) {
            where.category = { contains: category, mode: 'insensitive' };
        }
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                include: {
                    variants: true,
                },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.product.count({ where }),
        ]);
        return {
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }
    async getProductById(id) {
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
            include: {
                variants: true,
            },
        });
        if (!product) {
            throw (0, errorHandler_1.createError)('Product not found', 404);
        }
        return product;
    }
    async getProductBySlug(slug) {
        const product = await prisma_1.prisma.product.findUnique({
            where: { slug },
            include: {
                variants: true,
            },
        });
        if (!product) {
            throw (0, errorHandler_1.createError)('Product not found', 404);
        }
        return product;
    }
    async updateProduct(id, data) {
        const existingProduct = await prisma_1.prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            throw (0, errorHandler_1.createError)('Product not found', 404);
        }
        if (data.slug && data.slug !== existingProduct.slug) {
            const slugExists = await prisma_1.prisma.product.findUnique({
                where: { slug: data.slug },
            });
            if (slugExists) {
                throw (0, errorHandler_1.createError)('Product with this slug already exists', 409);
            }
        }
        return await prisma_1.prisma.product.update({
            where: { id },
            data,
            include: {
                variants: true,
            },
        });
    }
    async deleteProduct(id) {
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw (0, errorHandler_1.createError)('Product not found', 404);
        }
        await prisma_1.prisma.product.delete({
            where: { id },
        });
    }
    async addVariant(productId, variantData) {
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw (0, errorHandler_1.createError)('Product not found', 404);
        }
        const existingSku = await prisma_1.prisma.productVariant.findUnique({
            where: { sku: variantData.sku },
        });
        if (existingSku) {
            throw (0, errorHandler_1.createError)('SKU already exists', 409);
        }
        return await prisma_1.prisma.productVariant.create({
            data: {
                ...variantData,
                productId,
            },
        });
    }
    async updateVariant(variantId, variantData) {
        const variant = await prisma_1.prisma.productVariant.findUnique({
            where: { id: variantId },
        });
        if (!variant) {
            throw (0, errorHandler_1.createError)('Variant not found', 404);
        }
        if (variantData.sku && variantData.sku !== variant.sku) {
            const skuExists = await prisma_1.prisma.productVariant.findUnique({
                where: { sku: variantData.sku },
            });
            if (skuExists) {
                throw (0, errorHandler_1.createError)('SKU already exists', 409);
            }
        }
        return await prisma_1.prisma.productVariant.update({
            where: { id: variantId },
            data: variantData,
        });
    }
}
exports.ProductService = ProductService;
exports.default = new ProductService();
//# sourceMappingURL=productService.js.map