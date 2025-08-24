import express from 'express';
import promoService from '../services/promoService';
import { validate } from '../middleware/validation';
import { createPromoSchema, applyPromoSchema, paginationSchema } from '../schemas/validation';
import { extractGuestToken, extractUserToken } from '../utils/auth';
import { authenticateToken, requireAdmin, optionalAuth, guestOrAuth, ensureGuestToken, AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Promo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [PERCENTAGE, FIXED]
 *         value:
 *           type: number
 *         minAmount:
 *           type: number
 *         maxDiscount:
 *           type: number
 *         usageLimit:
 *           type: integer
 *         usageCount:
 *           type: integer
 *         validFrom:
 *           type: string
 *           format: date-time
 *         validTo:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, EXPIRED]
 */

/**
 * @swagger
 * /api/promos:
 *   get:
 *     summary: 🎫 Browse available promotions (Public)
 *     description: |
 *       **PUBLIC ENDPOINT**: Browse active promotions and discount codes.
 *       
 *       **No authentication required**
 *       
 *       **Returns only ACTIVE promos** that are currently valid.
 *       
 *       **Use Cases**:
 *       - Display available promotions to customers
 *       - Show promotional banners on website
 *       - Let customers discover discount codes
 *       - Marketing campaign integration
 *       
 *       **For Admin**: Use with admin token to see all promos including inactive ones.
 *     tags: [Promos]
 *     security:
 *       - BearerAuth: []
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
 *           maximum: 50
 *           default: 10
 *         description: Number of promos per page
 *         example: 10
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *         description: |
 *           **Optional**: 
 *           - No header = Public view (active promos only)
 *           - `Bearer <admin-jwt>` = Admin view (all promos)
 *         example: "Bearer <admin-jwt-token>"
 *     responses:
 *       200:
 *         description: ✅ Promotions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 promos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Promo'
 *                 pagination:
 *                   type: object
 *                   required: ['page', 'limit', 'total', 'totalPages']
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *             examples:
 *               public_view:
 *                 summary: Public view (active promos only)
 *                 value:
 *                   promos:
 *                     - id: "64f5e8b12345abcd67890123"
 *                       code: "SUMMER20"
 *                       name: "Summer Sale"
 *                       description: "20% off all items"
 *                       type: "PERCENTAGE"
 *                       value: 20
 *                       status: "ACTIVE"
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     total: 5
 *                     totalPages: 1
 *       500:
 *         description: ❌ Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', optionalAuth, validate(paginationSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isAdmin = req.user && req.user.role === 'admin';
    const result = await promoService.getPromos(page, limit, isAdmin);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos/apply:
 *   post:
 *     summary: 🎯 Apply promo code to cart (Guest/User)
 *     description: |
 *       **GUEST/USER ENDPOINT**: Apply a promotional code to a shopping cart.
 *       
 *       **Authentication Options**:
 *       - **Guest**: Use guest token or no token (new guest token will be generated)
 *       - **Registered User**: Use JWT token to apply to user's cart
 *       
 *       **Features**:
 *       - Validates promo code and requirements
 *       - Calculates discount amount
 *       - Checks minimum cart amount
 *       - Verifies usage limits and expiry
 *       
 *       **How it works**:
 *       - **No token**: Creates new guest cart and returns guest token in X-Guest-Token header
 *       - **Guest token**: Applies promo to existing guest cart
 *       - **User token**: Applies promo to user's cart
 *       
 *       **Use Cases**:
 *       - Apply discount during checkout
 *       - Validate promo codes in real-time
 *       - Calculate final pricing with discounts
 *     tags: [Promos]
 *     security:
 *       - BearerAuth: []
 *       - GuestToken: []
 *       - {}
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *         description: |
 *           **Optional**: 
 *           - No header = New guest cart created
 *           - `Bearer <guest-token>` = Existing guest cart
 *           - `Bearer <jwt-token>` = User cart
 *         example: "Bearer guest-uuid-token-here"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - promoCode
 *             properties:
 *               promoCode:
 *                 type: string
 *                 description: Promotional code to apply
 *                 example: "SUMMER20"
 *           examples:
 *             percentage_discount:
 *               summary: Apply percentage discount
 *               value:
 *                 promoCode: "SUMMER20"
 *             fixed_discount:
 *               summary: Apply fixed amount discount
 *               value:
 *                 promoCode: "SAVE10"
 *     responses:
 *       200:
 *         description: ✅ Promo code applied successfully
 *         headers:
 *           X-Guest-Token:
 *             description: Guest token (only for new guest carts)
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Promo code applied successfully"
 *                 promo:
 *                   $ref: '#/components/schemas/Promo'
 *                 discount:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                       description: Discount amount calculated
 *                       example: 25.50
 *                     originalSubtotal:
 *                       type: number
 *                       example: 127.50
 *                     finalSubtotal:
 *                       type: number
 *                       example: 102.00
 *             examples:
 *               percentage_applied:
 *                 summary: 20% discount applied
 *                 value:
 *                   message: "Promo code applied successfully"
 *                   promo:
 *                     code: "SUMMER20"
 *                     name: "Summer Sale"
 *                     type: "PERCENTAGE"
 *                     value: 20
 *                   discount:
 *                     amount: 25.50
 *                     originalSubtotal: 127.50
 *                     finalSubtotal: 102.00
 *       400:
 *         description: ❌ Invalid promo code or requirements not met
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               expired_code:
 *                 summary: Promo code expired
 *                 value:
 *                   error:
 *                     message: "Promo code has expired or is not yet valid"
 *                     status: 400
 *               minimum_not_met:
 *                 summary: Minimum amount not met
 *                 value:
 *                   error:
 *                     message: "Cart total must be at least $50.00 to use this promo"
 *                     status: 400
 *       404:
 *         description: ❌ Promo code not found or cart not found
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
router.post('/apply', guestOrAuth, ensureGuestToken, validate(applyPromoSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    let guestToken: string | undefined;
    let userId: string | undefined;
    
    if (req.user) {
      userId = req.user.id;
    } else {
      guestToken = req.guestToken;
    }
    
    const result = await promoService.applyPromoToCart(guestToken, req.body.promoCode, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos/remove:
 *   delete:
 *     summary: ❌ Remove applied promo code from cart (Guest/User)
 *     description: |
 *       **GUEST/USER ENDPOINT**: Remove the currently applied promo code from cart.
 *       
 *       **Authentication Options**:
 *       - **Guest**: Use guest token to remove promo from guest cart
 *       - **Registered User**: Use JWT token to remove promo from user cart
 *       
 *       **Response includes**:
 *       - Success message
 *       - Updated cart without promo discount
 *     tags: [Promos]
 *     security:
 *       - BearerAuth: []
 *       - GuestToken: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           **Required**: 
 *           - `Bearer <guest-token>` = Remove from guest cart
 *           - `Bearer <jwt-token>` = Remove from user cart
 *         example: "Bearer guest-uuid-token-here"
 *     responses:
 *       200:
 *         description: ✅ Promo code removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Promo code removed successfully"
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: ❌ No promo code applied to cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ❌ Cart not found
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
router.delete('/remove', guestOrAuth, ensureGuestToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    let guestToken: string | undefined;
    let userId: string | undefined;
    
    if (req.user) {
      userId = req.user.id;
    } else {
      guestToken = req.guestToken;
    }
    
    const result = await promoService.removePromoFromCart(guestToken, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos:
 *   post:
 *     summary: ➕ Create new promotion (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Create a new promotional code or discount.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Features**:
 *       - Create percentage or fixed amount discounts
 *       - Set usage limits and expiry dates
 *       - Configure minimum cart requirements
 *       - Set maximum discount caps
 *       
 *       **Use Cases**:
 *       - Launch seasonal sales campaigns
 *       - Create customer-specific discounts
 *       - Set up bulk purchase incentives
 *       - Marketing promotion management
 *     tags: [Promos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - type
 *               - value
 *               - validFrom
 *               - validTo
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique promo code (uppercase recommended)
 *                 example: "SUMMER20"
 *               name:
 *                 type: string
 *                 description: Display name for the promotion
 *                 example: "Summer Sale 2024"
 *               description:
 *                 type: string
 *                 description: Detailed description of the offer
 *                 example: "Get 20% off all summer collection items"
 *               type:
 *                 type: string
 *                 enum: [PERCENTAGE, FIXED]
 *                 description: Type of discount
 *                 example: "PERCENTAGE"
 *               value:
 *                 type: number
 *                 description: Discount value (percentage 0-100 or fixed amount)
 *                 example: 20
 *               minAmount:
 *                 type: number
 *                 description: Minimum cart amount required (optional)
 *                 example: 50.00
 *               maxDiscount:
 *                 type: number
 *                 description: Maximum discount amount for percentage promos (optional)
 *                 example: 100.00
 *               usageLimit:
 *                 type: integer
 *                 description: Maximum number of times this promo can be used (optional)
 *                 example: 1000
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 description: When the promo becomes active
 *                 example: "2024-06-01T00:00:00Z"
 *               validTo:
 *                 type: string
 *                 format: date-time
 *                 description: When the promo expires
 *                 example: "2024-07-31T23:59:59Z"
 *           examples:
 *             percentage_promo:
 *               summary: 20% summer discount
 *               value:
 *                 code: "SUMMER20"
 *                 name: "Summer Sale"
 *                 description: "20% off summer items"
 *                 type: "PERCENTAGE"
 *                 value: 20
 *                 minAmount: 50
 *                 maxDiscount: 100
 *                 usageLimit: 1000
 *                 validFrom: "2024-06-01T00:00:00Z"
 *                 validTo: "2024-08-31T23:59:59Z"
 *             fixed_promo:
 *               summary: $10 off welcome discount
 *               value:
 *                 code: "WELCOME10"
 *                 name: "Welcome Discount"
 *                 description: "$10 off your first order"
 *                 type: "FIXED"
 *                 value: 10
 *                 minAmount: 25
 *                 usageLimit: 500
 *                 validFrom: "2024-01-01T00:00:00Z"
 *                 validTo: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Promo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 */
router.post('/', authenticateToken, requireAdmin, validate(createPromoSchema), async (req, res, next) => {
  try {
    const promo = await promoService.createPromo(req.body);
    res.status(201).json(promo);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos/{id}:
 *   get:
 *     summary: 📋 Get promo by ID (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Get detailed information about a specific promotion.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Use Cases**:
 *       - View promo details for management
 *       - Check promo usage statistics
 *       - Audit promotional campaigns
 *     tags: [Promos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promo ID
 *         example: "64f5e8b12345abcd67890123"
 *     responses:
 *       200:
 *         description: ✅ Promo details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
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
 *         description: ❌ Promo not found
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
router.get('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const promo = await promoService.getPromoById(req.params.id);
    res.json(promo);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos/{id}:
 *   put:
 *     summary: 📝 Update promotion (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Update an existing promotional code or discount.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Use Cases**:
 *       - Extend promo expiry dates
 *       - Adjust discount values
 *       - Update usage limits
 *       - Modify promo descriptions
 *     tags: [Promos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promo ID to update
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
 *                 example: "Updated Summer Sale"
 *               description:
 *                 type: string
 *                 example: "Extended summer sale with better discounts"
 *               value:
 *                 type: number
 *                 example: 25
 *               minAmount:
 *                 type: number
 *                 example: 75.00
 *               maxDiscount:
 *                 type: number
 *                 example: 150.00
 *               usageLimit:
 *                 type: integer
 *                 example: 2000
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-10T00:00:00Z"
 *               validTo:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-25T00:00:00Z"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, EXPIRED]
 *                 example: "ACTIVE"
 *     responses:
 *       200:
 *         description: ✅ Promo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
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
 *         description: ❌ Promo not found
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
router.put('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const promo = await promoService.updatePromo(req.params.id, req.body);
    res.json(promo);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/promos/{id}:
 *   delete:
 *     summary: 🗑️ Delete promotion (Admin Only)
 *     description: |
 *       **ADMIN ONLY**: Delete a promotional code from the system.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Warning**: This action is irreversible and will:
 *       - Remove the promo code permanently
 *       - Prevent future use of this promo
 *       - Maintain order history for completed orders
 *       
 *       **Use Cases**:
 *       - Remove expired promotional campaigns
 *       - Clean up test promo codes
 *       - Remove problematic or abused codes
 *     tags: [Promos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promo ID to delete
 *         example: "64f5e8b12345abcd67890123"
 *     responses:
 *       200:
 *         description: ✅ Promo deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Promo deleted successfully"
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
 *         description: ❌ Promo not found
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
    const result = await promoService.deletePromo(req.params.id);
    res.json({ message: 'Promo deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
