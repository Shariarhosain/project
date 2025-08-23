import express from 'express';
import cartService from '../services/cartService';
import { validate } from '../middleware/validation';
import { addToCartSchema, updateCartItemSchema } from '../schemas/validation';
import { guestOrAuth, ensureGuestToken, requireUser, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         guestToken:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         itemCount:
 *           type: integer
 *         subtotal:
 *           type: number
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         quantity:
 *           type: integer
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         variant:
 *           $ref: '#/components/schemas/ProductVariant'
 */

/**
 * @swagger
 * /api/carts:
 *   get:
 *     summary: 🛍️ Get or create shopping cart (Guest/User)
 *     description: |
 *       **GUEST/USER ENDPOINT**: Get current cart or create a new one.
 *       
 *       **Authentication Options**:
 *       - **Guest**: No token needed - A new guest token will be generated
 *       - **Existing Guest**: Use guest token to retrieve existing cart
 *       - **Registered User**: Use JWT token to link cart to user account
 *       
 *       **How it works**:
 *       1. **No token**: Creates new guest cart and returns guest token in X-Guest-Token header
 *       2. **Guest token**: Returns existing guest cart (same token preserved)
 *       3. **User token**: Returns user's cart or creates one
 *       
 *       **Response includes**:
 *       - Cart items with product details
 *       - Item count and subtotal
 *       - Guest token (for guest users only)
 *       
 *       **Use Cases**:
 *       - Initialize shopping cart on page load
 *       - Check cart contents before checkout
 *       - Get guest token for subsequent requests
 *     tags: [Carts]
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
 *     responses:
 *       200:
 *         description: Cart details
 *         headers:
 *           X-Guest-Token:
 *             description: Guest token (only for new guest carts)
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.get('/', guestOrAuth, ensureGuestToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    let cart;
    
    if (req.user) {
      // User is authenticated, get/create user cart
      cart = await cartService.getOrCreateCart(undefined, req.user.id);
    } else {
      // Guest user, use guest token
      cart = await cartService.getOrCreateCart(req.guestToken);
    }
    
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/carts/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Carts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - variantId
 *             properties:
 *               variantId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       200:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.post('/items', guestOrAuth, ensureGuestToken, validate(addToCartSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    let cart;
    
    if (req.user) {
      // User is authenticated, add to user cart
      cart = await cartService.addToCart(undefined, req.body, req.user.id);
    } else {
      // Guest user, add to guest cart
      cart = await cartService.addToCart(req.guestToken!, req.body);
    }
    
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/carts/items/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Carts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.put('/items/:itemId', guestOrAuth, validate(updateCartItemSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user && !req.guestToken) {
      throw createError('Authentication required', 401);
    }
    
    // For now, use guest token approach for both users and guests
    // TODO: Update cart service to handle user-based operations
    const tokenToUse = req.user ? `user:${req.user.id}` : req.guestToken!;
    const cart = await cartService.updateCartItem(tokenToUse, req.params.itemId, req.body);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/carts/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Carts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.delete('/items/:itemId', guestOrAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user && !req.guestToken) {
      throw createError('Authentication required', 401);
    }
    
    const tokenToUse = req.user ? `user:${req.user.id}` : req.guestToken!;
    const cart = await cartService.removeCartItem(tokenToUse, req.params.itemId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/carts/clear:
 *   post:
 *     summary: Clear all items from cart
 *     tags: [Carts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.post('/clear', guestOrAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user && !req.guestToken) {
      throw createError('Authentication required', 401);
    }
    
    const tokenToUse = req.user ? `user:${req.user.id}` : req.guestToken!;
    const cart = await cartService.clearCart(tokenToUse);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

export default router;
