import express from 'express';
import productService from '../services/productService';
import { validate } from '../middleware/validation';
import { authenticateToken, requireAdmin, optionalAuth, guestOrAuth } from '../middleware/auth';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../schemas/validation';
import { createError } from '../middleware/errorHandler';
import { uploadImages, processImages } from '../middleware/upload';
import multer from 'multer';

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
 *     summary: ➕ Create a new product with images (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Create a new product in the catalog with direct image upload.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Features**:
 *       - Create product with multiple variants
 *       - Upload product images directly (no separate upload needed!)
 *       - Set pricing and inventory per variant
 *       - Define product attributes
 *       
 *       **How to use**:
 *       1. Fill in the product data (name, description, slug, category)
 *       2. Add variants with pricing and inventory
 *       3. Upload image files directly in the "images" field
 *       4. Submit everything in one request!
 *       
 *       **Use Cases**:
 *       - Add new products to catalog with images
 *       - Launch new product lines
 *       - Manage inventory and pricing
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DISCONTINUED]
 *                 description: Product status (defaults to ACTIVE if not provided)
 *                 example: "ACTIVE"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: |
 *                   **UPLOAD IMAGES DIRECTLY HERE!**
 *                   
 *                   - Select multiple image files (JPG, PNG, WebP, GIF)
 *                   - Max 5MB per image, up to 10 images
 *                   - Images will be automatically resized and optimized
 *                   - Thumbnails will be generated automatically
 *                 maxItems: 10
 *               variants:
 *                 type: string
 *                 description: |
 *                   Product variants in JSON format. Use this format:
 *                   
 *                   ```json
 *                   [
 *                     {
 *                       "name": "128GB Space Black",
 *                       "sku": "IPH15P-128-BLK",
 *                       "price": 999.99,
 *                       "inventory": 50,
 *                       "attributes": {"storage": "128GB", "color": "Space Black"}
 *                     }
 *                   ]
 *                   ```
 *                 example: '[{"name":"128GB Space Black","sku":"IPH15P-128-BLK","price":999.99,"inventory":50,"attributes":{"storage":"128GB","color":"Space Black"}}]'
 *           encoding:
 *             images:
 *               contentType: image/jpeg, image/png, image/webp, image/gif
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
router.post('/', authenticateToken, requireAdmin, (req, res, next) => {
  uploadImages(req, res, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
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
      // Parse variants from JSON string
      let variants;
      if (req.body.variants) {
        try {
          variants = JSON.parse(req.body.variants);
        } catch (parseError) {
          return res.status(400).json({
            error: 'INVALID_VARIANTS',
            message: 'Variants must be valid JSON format'
          });
        }
      }

      // Process uploaded images
      let imageUrls: string[] = [];
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const processedImages = await processImages(files, req);
        imageUrls = processedImages.map(img => img.url);
      }

      // Prepare product data
      const productData = {
        name: req.body.name,
        description: req.body.description,
        slug: req.body.slug,
        category: req.body.category,
        status: (req.body.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED',
        images: imageUrls,
        variants: variants || []
      };

      // Validate required fields
      if (!productData.name || !productData.slug || !productData.category || !productData.variants.length) {
        return res.status(400).json({
          error: 'MISSING_REQUIRED_FIELDS',
          message: 'Name, slug, category, and at least one variant are required'
        });
      }

      const product = await productService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });
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

/**
 * @swagger
 * /api/products/upload-image:
 *   post:
 *     summary: 📷 Upload Product Images (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Upload product images for use in product creation or updates.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Features**:
 *       - Upload single or multiple images
 *       - Supports common image formats (JPG, PNG, WebP, GIF)
 *       - Automatic image optimization and resizing
 *       - Returns secure image URLs for use in product data
 *       
 *       **File Requirements**:
 *       - Max file size: 5MB per image
 *       - Supported formats: .jpg, .jpeg, .png, .webp, .gif
 *       - Recommended dimensions: 800x800px or higher
 *       
 *       **Use Cases**:
 *       - Upload images before creating products
 *       - Add additional images to existing products
 *       - Bulk image upload for product catalogs
 *       
 *       **Next Steps**:
 *       - Use returned URLs in POST/PUT /api/products endpoints
 *       - Include URLs in the "images" array when creating products
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product image files (JPG, PNG, WebP, GIF)
 *                 minItems: 1
 *                 maxItems: 10
 *               alt_text:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Alt text for each image (optional, for accessibility)
 *                 example: ["Front view of iPhone 15 Pro", "Back view showing camera"]
 *               category:
 *                 type: string
 *                 description: Image category for organization (optional)
 *                 example: "product-photos"
 *                 enum: ["product-photos", "lifestyle", "technical", "packaging"]
 *           encoding:
 *             images:
 *               contentType: image/jpeg, image/png, image/webp, image/gif
 *     responses:
 *       200:
 *         description: ✅ Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Images uploaded successfully"
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "img_64f5e8b12345abcd67890123"
 *                       url:
 *                         type: string
 *                         example: "https://yourdomain.com/uploads/products/iphone-15-pro-front.jpg"
 *                       thumbnail:
 *                         type: string
 *                         example: "https://yourdomain.com/uploads/products/thumbs/iphone-15-pro-front.jpg"
 *                       alt_text:
 *                         type: string
 *                         example: "Front view of iPhone 15 Pro"
 *                       size:
 *                         type: integer
 *                         example: 245760
 *                       width:
 *                         type: integer
 *                         example: 800
 *                       height:
 *                         type: integer
 *                         example: 800
 *                       format:
 *                         type: string
 *                         example: "jpeg"
 *             examples:
 *               single_image:
 *                 summary: Single image upload response
 *                 value:
 *                   message: "Images uploaded successfully"
 *                   images:
 *                     - id: "img_64f5e8b12345abcd67890123"
 *                       url: "https://yourdomain.com/uploads/products/iphone-15-pro-front.jpg"
 *                       thumbnail: "https://yourdomain.com/uploads/products/thumbs/iphone-15-pro-front.jpg"
 *                       alt_text: "Front view of iPhone 15 Pro"
 *                       size: 245760
 *                       width: 800
 *                       height: 800
 *                       format: "jpeg"
 *               multiple_images:
 *                 summary: Multiple images upload response
 *                 value:
 *                   message: "Images uploaded successfully"
 *                   images:
 *                     - id: "img_64f5e8b12345abcd67890123"
 *                       url: "https://yourdomain.com/uploads/products/iphone-15-pro-front.jpg"
 *                       thumbnail: "https://yourdomain.com/uploads/products/thumbs/iphone-15-pro-front.jpg"
 *                       alt_text: "Front view of iPhone 15 Pro"
 *                       size: 245760
 *                       width: 800
 *                       height: 800
 *                       format: "jpeg"
 *                     - id: "img_64f5e8b12345abcd67890124"
 *                       url: "https://yourdomain.com/uploads/products/iphone-15-pro-back.jpg"
 *                       thumbnail: "https://yourdomain.com/uploads/products/thumbs/iphone-15-pro-back.jpg"
 *                       alt_text: "Back view showing camera"
 *                       size: 198432
 *                       width: 800
 *                       height: 800
 *                       format: "jpeg"
 *       400:
 *         description: ❌ Invalid file format or size
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_format:
 *                 summary: Unsupported file format
 *                 value:
 *                   error: "INVALID_FILE_FORMAT"
 *                   message: "Only JPG, PNG, WebP, and GIF images are allowed"
 *               file_too_large:
 *                 summary: File size exceeded
 *                 value:
 *                   error: "FILE_TOO_LARGE"
 *                   message: "Image file size must be less than 5MB"
 *               no_files:
 *                 summary: No files provided
 *                 value:
 *                   error: "NO_FILES"
 *                   message: "At least one image file is required"
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
 *       413:
 *         description: ❌ Request entity too large
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
router.post('/upload-image', authenticateToken, requireAdmin, (req, res, next) => {
  uploadImages(req, res, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
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
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          error: 'NO_FILES',
          message: 'At least one image file is required'
        });
      }

      const processedImages = await processImages(files, req);

      res.json({
        message: 'Images uploaded successfully',
        images: processedImages
      });
    } catch (error) {
      next(error);
    }
  });
});

export default router;
