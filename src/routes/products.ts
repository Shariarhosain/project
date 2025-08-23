import express from 'express';
import productService from '../services/productService';
import { validate } from '../middleware/validation';
import { authenticateToken, requireAdmin, optionalAuth, guestOrAuth } from '../middleware/auth';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../schemas/validation';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The product name
 *         description:
 *           type: string
 *           description: The product description
 *         slug:
 *           type: string
 *           description: The product slug
 *         category:
 *           type: string
 *           description: The product category
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DISCONTINUED]
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariant'
 *     ProductVariant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         sku:
 *           type: string
 *         price:
 *           type: number
 *         inventory:
 *           type: integer
 *         attributes:
 *           type: object
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 📦 Browse Products (Public)
 *     description: |
 *       **PUBLIC ENDPOINT**: Browse the product catalog with filtering and search.
 *       
 *       **No authentication required** - Perfect for guest users!
 *       
 *       **Features**:
 *       - Search by name or description
 *       - Filter by category and status
 *       - Pagination support
 *       - View product variants with pricing
 *       
 *       **Use Cases**:
 *       - Browse products as a guest
 *       - Search for specific items
 *       - View product details before adding to cart
 *       
 *       **Next Steps**:
 *       - Add products to cart via POST /api/carts/items
 *       - View individual product details via GET /api/products/:slug
 *     tags: [Products]
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
 *         description: Number of products per page
 *         example: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (case-insensitive)
 *         example: "electronics"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DISCONTINUED]
 *         description: Filter by product status
 *         example: "ACTIVE"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or description
 *         example: "smartphone"
 *     responses:
 *       200:
 *         description: ✅ Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 */
router.get('/', validate(productQuerySchema), async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: ➕ Create a new product (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Create a new product in the catalog.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Features**:
 *       - Create product with multiple variants
 *       - Set pricing and inventory per variant
 *       - Define product attributes and images
 *       
 *       **Use Cases**:
 *       - Add new products to catalog
 *       - Launch new product lines
 *       - Manage inventory and pricing
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - category
 *               - variants
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: "iPhone 15 Pro"
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: "Latest smartphone with advanced features"
 *               slug:
 *                 type: string
 *                 description: URL-friendly product identifier
 *                 example: "iphone-15-pro"
 *               category:
 *                 type: string
 *                 description: Product category
 *                 example: "smartphones"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Product image URLs
 *                 example: ["https://example.com/image1.jpg"]
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - sku
 *                     - price
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "128GB Space Black"
 *                     sku:
 *                       type: string
 *                       example: "IPH15P-128-BLK"
 *                     price:
 *                       type: number
 *                       example: 999.99
 *                     inventory:
 *                       type: integer
 *                       example: 50
 *                     attributes:
 *                       type: object
 *                       example: {"storage": "128GB", "color": "Space Black"}
 *     responses:
 *       201:
 *         description: ✅ Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
 *         description: ❌ Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: ❌ Product with this slug already exists
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
router.post('/', authenticateToken, requireAdmin, validate(createProductSchema), async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: 📦 Get product by ID (Public)
 *     description: |
 *       **PUBLIC ENDPOINT**: Get detailed information about a specific product by ID.
 *       
 *       **No authentication required**
 *       
 *       **Returns**:
 *       - Complete product information
 *       - All product variants with pricing
 *       - Stock availability
 *       - Product images and descriptions
 *       
 *       **Use Cases**:
 *       - View product details page
 *       - Check product availability
 *       - Get variant pricing information
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "64f5e8b12345abcd67890123"
 *     responses:
 *       200:
 *         description: ✅ Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: ❌ Product not found
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
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: 📦 Get product by slug (Public)
 *     description: |
 *       **PUBLIC ENDPOINT**: Get detailed product information using SEO-friendly slug.
 *       
 *       **No authentication required**
 *       
 *       **Preferred over ID lookup** for public-facing applications.
 *       
 *       **Use Cases**:
 *       - Product detail pages with SEO-friendly URLs
 *       - Direct product links from marketing campaigns
 *       - Product sharing via social media
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product URL slug
 *         example: "iphone-15-pro"
 *     responses:
 *       200:
 *         description: ✅ Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: 📝 Update product (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Update an existing product in the catalog.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Features**:
 *       - Update product information
 *       - Change product status (ACTIVE, INACTIVE, DISCONTINUED)
 *       - Modify pricing and inventory via variants
 *       
 *       **Use Cases**:
 *       - Update product descriptions
 *       - Change product status
 *       - Update categories and tags
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to update
 *         example: "64f5e8b12345abcd67890123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Product Name"
 *               description:
 *                 type: string
 *                 example: "Updated product description"
 *               slug:
 *                 type: string
 *                 example: "updated-product-slug"
 *               category:
 *                 type: string
 *                 example: "electronics"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DISCONTINUED]
 *                 example: "ACTIVE"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/new-image.jpg"]
 *     responses:
 *       200:
 *         description: ✅ Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
 *         description: ❌ Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ❌ Product not found
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
router.put('/:id', authenticateToken, requireAdmin, validate(updateProductSchema), async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: 🗑️ Delete product (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Remove a product from the catalog.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Warning**: This action is irreversible and will:
 *       - Remove the product from all carts
 *       - Prevent future orders of this product
 *       - Maintain order history for completed orders
 *       
 *       **Use Cases**:
 *       - Remove discontinued products
 *       - Clean up test products
 *       - Remove products with legal issues
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to delete
 *         example: "64f5e8b12345abcd67890123"
 *     responses:
 *       200:
 *         description: ✅ Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product deleted successfully"
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
 *         description: ❌ Product not found
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
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
