import express from 'express';
import orderService from '../services/orderService';
import { validate } from '../middleware/validation';
import { createOrderSchema, paginationSchema } from '../schemas/validation';
import { extractGuestToken } from '../utils/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         orderNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *         subtotal:
 *           type: number
 *         discount:
 *           type: number
 *         total:
 *           type: number
 *         customerInfo:
 *           type: object
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         promo:
 *           $ref: '#/components/schemas/Promo'
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         quantity:
 *           type: integer
 *         unitPrice:
 *           type: number
 *         totalPrice:
 *           type: number
 *         productName:
 *           type: string
 *         variantName:
 *           type: string
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         variant:
 *           $ref: '#/components/schemas/ProductVariant'
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query as any;
    const result = await orderService.getOrders(page, limit, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order from cart
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         description: Bearer token for guest cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerInfo
 *             properties:
 *               customerInfo:
 *                 type: object
 *                 required:
 *                   - name
 *                   - email
 *                   - address
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: object
 *                     required:
 *                       - street
 *                       - city
 *                       - state
 *                       - zipCode
 *                       - country
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *               promoCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.post('/', validate(createOrderSchema), async (req, res, next) => {
  try {
    const guestToken = extractGuestToken(req.headers.authorization);
    
    if (!guestToken) {
      throw createError('Guest token is required', 401);
    }
    
    const order = await orderService.createOrder(guestToken, req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/number/{orderNumber}:
 *   get:
 *     summary: Get order by order number
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/number/:orderNumber', async (req, res, next) => {
  try {
    const order = await orderService.getOrderByNumber(req.params.orderNumber);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      throw createError('Status is required', 400);
    }
    
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/analytics:
 *   get:
 *     summary: Get order analytics
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                 ordersByStatus:
 *                   type: object
 *                 recentOrders:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/analytics', async (req, res, next) => {
  try {
    const analytics = await orderService.getOrderAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;
