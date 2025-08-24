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
 *           - `Bearer <guest-uuid>` = Existing guest cart (UUID format)
 *           - `Bearer <jwt-token>` = User cart (JWT format)
 *           
 *           **Note**: In Swagger UI, paste only the token value (without "Bearer " prefix)
 *         example: "963154cb-1f97-4fc2-8a08-ad8ccae7ce84"
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
 *     summary: ➕ Add item to cart (Guest/User)
 *     description: |
 *       **GUEST/USER ENDPOINT**: Add a product variant to the shopping cart.
 *       
 *       **Authentication Options**:
 *       - **Guest**: Use guest token or no token (new guest token will be generated)
 *       - **Registered User**: Use JWT token to add to user's cart
 *       
 *       **How it works**:
 *       - **No token**: Creates new guest cart and returns guest token in X-Guest-Token header
 *       - **Guest token**: Adds to existing guest cart
 *       - **User token**: Adds to user's cart
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
 *     summary: 🔄 Update cart item quantity (Guest/User)
 *     description: |
 *       **GUEST/USER ENDPOINT**: Update the quantity of an item in the cart.
 *       
 *       **Authentication Options**:
 *       - **Guest**: Use guest token or no token (new guest token will be generated)
 *       - **Registered User**: Use JWT token to update user's cart
 *       
 *       **How it works**:
 *       - **No token**: Creates new guest cart and returns guest token in X-Guest-Token header
 *       - **Guest token**: Updates existing guest cart item
 *       - **User token**: Updates user's cart item
 *     tags: [Carts]
 *     security:
 *       - BearerAuth: []
 *       - GuestToken: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
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
router.put('/items/:itemId', guestOrAuth, ensureGuestToken, validate(updateCartItemSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
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
 *     summary: 🗑️ Remove item from cart (Guest/User)
 *     description: |
 *       **GUEST/USER ENDPOINT**: Remove an item completely from the cart.
 *       
 *       **Authentication Options**:
 *       - **Guest**: Use guest token or no token (new guest token will be generated)
 *       - **Registered User**: Use JWT token to remove from user's cart
 *       
 *       **How it works**:
 *       - **No token**: Creates new guest cart and returns guest token in X-Guest-Token header
 *       - **Guest token**: Removes item from existing guest cart
 *       - **User token**: Removes item from user's cart
 *     tags: [Carts]
 *     security:
 *       - BearerAuth: []
 *       - GuestToken: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
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
 *         description: Item removed from cart
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
router.delete('/items/:itemId', guestOrAuth, ensureGuestToken, async (req: AuthenticatedRequest, res, next) => {
  try {
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
 *     summary: 🧹 Clear all items from cart (Guest/User)
 *     description: |
 *       **GUEST/USER ENDPOINT**: Remove all items from the cart.
 *       
 *       **Authentication Options**:
 *       - **Guest**: Use guest token or no token (new guest token will be generated)
 *       - **Registered User**: Use JWT token to clear user's cart
 *       
 *       **How it works**:
 *       - **No token**: Creates new guest cart and returns guest token in X-Guest-Token header
 *       - **Guest token**: Clears existing guest cart
 *       - **User token**: Clears user's cart
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
 *         description: Cart cleared
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
router.post('/clear', guestOrAuth, ensureGuestToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const tokenToUse = req.user ? `user:${req.user.id}` : req.guestToken!;
    const cart = await cartService.clearCart(tokenToUse);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

export default router;
