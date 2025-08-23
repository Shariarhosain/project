import express from 'express';
import orderService from '../services/orderService';
import { validate } from '../middleware/validation';
import { createOrderSchema, paginationSchema } from '../schemas/validation';
import { extractGuestToken, extractUserToken } from '../utils/auth';
import { authenticateToken, requireAdmin, optionalAuth, requireUser, AuthenticatedRequest } from '../middleware/auth';
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
 *     summary: Get orders with role-based access
 *     description: |
 *       **USER/ADMIN REQUIRED**: Get orders based on user role and authentication.
 *       
 *       **Required**: Valid JWT token in Authorization header
 *       
 *       **Access Control**:
 *       - **Users**: Can only see their own orders
 *       - **Admins**: Can see all orders in the system
 *       
 *       **Features**:
 *       - Pagination support
 *       - Filter by order status
 *       - Complete order details with items
 *       - Customer information included
 *       
 *       **Use Cases**:
 *       - **Users**: View order history, track shipments
 *       - **Admins**: Manage all orders, analytics, fulfillment
 *     tags: [Orders]
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
 *         description: Number of orders per page
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *         description: Filter by order status
 *         example: "PENDING"
 *     responses:
 *       200:
 *         description: ✅ Orders retrieved successfully
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
 *                       example: 45
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                 summary:
 *                   type: object
 *                   description: Order statistics (admin only)
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       example: 12450.75
 *                     orderCounts:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         PENDING: 5
 *                         CONFIRMED: 12
 *                         SHIPPED: 20
 *                         DELIVERED: 8
 *             examples:
 *               user_orders:
 *                 summary: User viewing their orders
 *                 value:
 *                   orders:
 *                     - id: "64f5e8b12345abcd67890123"
 *                       orderNumber: "ORD-2024-001"
 *                       status: "SHIPPED"
 *                       total: 199.99
 *                       items: []
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     total: 3
 *                     totalPages: 1
 *               admin_orders:
 *                 summary: Admin viewing all orders with analytics
 *                 value:
 *                   orders: []
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     total: 45
 *                     totalPages: 5
 *                   summary:
 *                     totalRevenue: 12450.75
 *                     orderCounts:
 *                       PENDING: 5
 *                       CONFIRMED: 12
 *                       SHIPPED: 20
 *                       DELIVERED: 8
 *       401:
 *         description: ❌ Unauthorized - Missing or invalid token
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
router.get('/', authenticateToken, requireUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query as any;
    const user = req.user!;
    
    const result = await orderService.getOrders({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      userId: user.role === 'admin' ? undefined : user.id,
      isAdmin: user.role === 'admin'
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: 🛒 Create order from cart (User Authentication Required)
 *     description: |
 *       **USER AUTHENTICATION REQUIRED**: Create an order from the items in your cart.
 *       
 *       **🔐 Authentication**: Valid JWT token required in Authorization header
 *       - **Step 1**: Login via `POST /api/users/login` to get JWT token
 *       - **Step 2**: Use token to create authenticated order
 *       
 *       **Process Flow**:
 *       1. ✅ Validates user authentication with password login
 *       2. 🛒 Validates cart has items
 *       3. 🎫 Applies any promotional codes
 *       4. 💰 Calculates final totals
 *       5. 📝 Creates order record linked to user account
 *       6. 🗑️ Clears the cart
 *       7. ✉️ Sends confirmation
 *       
 *       **Security Features**:
 *       - Password-based authentication required
 *       - Order linked to verified user account
 *       - User order history tracking
 *       - Secure order tracking
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           **Required**: JWT authentication token from login
 *           Format: `Bearer <jwt-token>`
 *           Get token from: `POST /api/users/login`
 *         example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
 *                     description: Customer full name
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Customer email address
 *                     example: "john@example.com"
 *                   phone:
 *                     type: string
 *                     description: Customer phone number (optional)
 *                     example: "+1234567890"
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
 *                         description: Street address
 *                         example: "123 Main St"
 *                       city:
 *                         type: string
 *                         description: City name
 *                         example: "New York"
 *                       state:
 *                         type: string
 *                         description: State or province
 *                         example: "NY"
 *                       zipCode:
 *                         type: string
 *                         description: Postal/ZIP code
 *                         example: "10001"
 *                       country:
 *                         type: string
 *                         description: Country name
 *                         example: "United States"
 *               paymentInfo:
 *                 type: object
 *                 required:
 *                   - method
 *                 properties:
 *                   method:
 *                     type: string
 *                     enum: [CREDIT_CARD, DEBIT_CARD, PAYPAL, STRIPE, CASH_ON_DELIVERY]
 *                     description: Payment method
 *                     example: "CREDIT_CARD"
 *                   transactionId:
 *                     type: string
 *                     description: Payment gateway transaction ID (if applicable)
 *                     example: "pi_1234567890abcdef"
 *               notes:
 *                 type: string
 *                 description: Special instructions or notes for the order
 *                 example: "Please deliver between 2-4 PM"
 *           examples:
 *             user_order:
 *               summary: Logged-in user creating order
 *               value:
 *                 customerInfo:
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                   phone: "+1234567890"
 *                   address:
 *                     street: "123 Main St"
 *                     city: "New York"
 *                     state: "NY"
 *                     zipCode: "10001"
 *                     country: "United States"
 *                 paymentInfo:
 *                   method: "CREDIT_CARD"
 *                   transactionId: "pi_1234567890abcdef"
 *                 notes: "Please ring doorbell twice"
 *             guest_order:
 *               summary: Guest user creating order
 *               value:
 *                 customerInfo:
 *                   name: "Jane Smith"
 *                   email: "jane@example.com"
 *                   address:
 *                     street: "456 Oak Ave"
 *                     city: "Los Angeles"
 *                     state: "CA"
 *                     zipCode: "90210"
 *                     country: "United States"
 *                 paymentInfo:
 *                   method: "PAYPAL"
 *                   transactionId: "PAY-1234567890"
 *     responses:
 *       201:
 *         description: ✅ Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Order'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Order created successfully"
 *       400:
 *         description: ❌ Invalid request data or empty cart
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
 *       404:
 *         description: ❌ Cart not found or empty
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
router.post('/', authenticateToken, requireUser, validate(createOrderSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!; // User is guaranteed to exist with requireUser middleware
    
    const order = await orderService.createOrder(user.id, req.body, true);
    res.status(201).json({ message: 'Order created successfully', ...order });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/number/{orderNumber}:
 *   get:
 *     summary: Get order by order number for users and guests
 *     description: |
 *       **USER/GUEST**: Get order details using the order number.
 *       
 *       **Authentication Options**:
 *       - **Users**: Use JWT token to verify order ownership
 *       - **Guests**: No authentication needed (order numbers are unique and secure)
 *       
 *       **Use Cases**:
 *       - Track order status without account
 *       - Customer service lookups
 *       - Order confirmation emails
 *       - Share order details with others
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number (e.g., ORD-2024-001)
 *         example: "ORD-2024-001"
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *         description: |
 *           **Optional**: 
 *           - No header = Public order lookup
 *           - `Bearer <jwt-token>` = User order verification
 *         example: "Bearer <jwt-token>"
 *     responses:
 *       200:
 *         description: ✅ Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: ❌ Order not found
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
router.get('/number/:orderNumber', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { orderNumber } = req.params;
    const user = req.user;
    
    const order = await orderService.getOrderByNumber(orderNumber, user?.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID with role-based access control
 *     description: |
 *       **USER/ADMIN REQUIRED**: Get detailed order information by order ID.
 *       
 *       **Required**: Valid JWT token in Authorization header
 *       
 *       **Access Control**:
 *       - **Users**: Can only view their own orders
 *       - **Admins**: Can view any order
 *       
 *       **Use Cases**:
 *       - View detailed order information
 *       - Track order items and status
 *       - Customer service support
 *       - Order management
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *         example: "64f5e8b12345abcd67890123"
 *     responses:
 *       200:
 *         description: ✅ Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: ❌ Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: ❌ Forbidden - Cannot view other users' orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ❌ Order not found
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
router.get('/:id', authenticateToken, requireUser, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    const order = await orderService.getOrderById(id, user.role === 'admin' ? undefined : user.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status for admins only
 *     description: |
 *       **ADMIN ONLY**: Update the status of an order.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Order Status Flow**:
 *       PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
 *       
 *       **Alternative Statuses**: CANCELLED, REFUNDED
 *       
 *       **Use Cases**:
 *       - Order fulfillment workflow
 *       - Shipping notifications
 *       - Order cancellations
 *       - Refund processing
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID to update
 *         example: "64f5e8b12345abcd67890123"
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
 *                 description: New order status
 *                 example: "SHIPPED"
 *               notes:
 *                 type: string
 *                 description: Optional notes about the status change
 *                 example: "Order shipped via FedEx, tracking: 1234567890"
 *           examples:
 *             confirm_order:
 *               summary: Confirm pending order
 *               value:
 *                 status: "CONFIRMED"
 *                 notes: "Payment verified, order ready for processing"
 *             ship_order:
 *               summary: Ship confirmed order
 *               value:
 *                 status: "SHIPPED"
 *                 notes: "Shipped via FedEx, tracking: 1234567890"
 *             cancel_order:
 *               summary: Cancel order
 *               value:
 *                 status: "CANCELLED"
 *                 notes: "Cancelled at customer request"
 *     responses:
 *       200:
 *         description: ✅ Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: ❌ Invalid status transition or request data
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
 *         description: ❌ Order not found
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
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const order = await orderService.updateOrderStatus(id, status, notes);
    res.json(order);
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
router.get('/analytics', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query as any;
    const analytics = await orderService.getOrderAnalytics(startDate, endDate);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;
