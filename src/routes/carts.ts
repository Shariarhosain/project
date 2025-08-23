import express from 'express';
import cartService from '../services/cartService';
import { validate } from '../middleware/validation';
import { addToCartSchema, updateCartItemSchema } from '../schemas/validation';
import { extractGuestToken } from '../utils/auth';
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
 *     summary: Get or create cart
 *     tags: [Carts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
router.get('/', async (req, res, next) => {
  try {
    const guestToken = extractGuestToken(req.headers.authorization);
    const cart = await cartService.getOrCreateCart(guestToken || undefined);
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
router.post('/items', validate(addToCartSchema), async (req, res, next) => {
  try {
    let guestToken = extractGuestToken(req.headers.authorization);
    
    if (!guestToken) {
      // Create a new cart to get a guest token
      const newCart = await cartService.getOrCreateCart();
      guestToken = newCart.guestToken;
    }
    
    const cart = await cartService.addToCart(guestToken!, req.body);
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
router.put('/items/:itemId', validate(updateCartItemSchema), async (req, res, next) => {
  try {
    const guestToken = extractGuestToken(req.headers.authorization);
    
    if (!guestToken) {
      throw createError('Guest token is required', 401);
    }
    
    const cart = await cartService.updateCartItem(guestToken, req.params.itemId, req.body);
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
router.delete('/items/:itemId', async (req, res, next) => {
  try {
    const guestToken = extractGuestToken(req.headers.authorization);
    
    if (!guestToken) {
      throw createError('Guest token is required', 401);
    }
    
    const cart = await cartService.removeCartItem(guestToken, req.params.itemId);
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
router.post('/clear', async (req, res, next) => {
  try {
    const guestToken = extractGuestToken(req.headers.authorization);
    
    if (!guestToken) {
      throw createError('Guest token is required', 401);
    }
    
    const cart = await cartService.clearCart(guestToken);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

export default router;
