import express from 'express';
import orderService from '../services/orderService';
import { validate } from '../middleware/validation';
import { createOrderSchema, paginationSchema } from '../schemas/validation';
import { extractGuestToken, extractUserToken } from '../utils/auth';
import { authenticateToken, requireAdmin, optionalAuth, requireUser, guestOrAuth, ensureGuestToken, AuthenticatedRequest } from '../middleware/auth';
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
 *     summary: 🛒 Create order from cart (Guest/User Support with Account Creation)
 *     description: |
 *       **GUEST/USER SUPPORT**: Create an order from cart items with optional account creation.
 *       
 *       **⚠️ PREREQUISITES**: 
 *       - **Cart must have items**: Use `POST /api/carts/items` to add products first
 *       - **Guest token required**: Use the same guest token for cart and order operations
 *       
 *       **🔐 Authentication Options**:
 *       - **Guest Orders**: Use guest token from cart operations
 *       - **User Orders**: Use JWT token in Authorization header
 *       - **Account Creation**: Guests can create accounts during checkout
 *       
 *       **📋 Step-by-Step Workflow**:
 *       1. **Add items to cart**: `POST /api/carts/items` with guest token
 *       2. **Create order**: Use same guest token for this endpoint
 *       
 *       **Process Flow**:
 *       1. 🛒 Validates cart has items (guest or user cart)
 *       2. 👤 Optionally creates user account if requested by guest
 *       3. 🎫 Applies any promotional codes
 *       4. 💰 Calculates final totals
 *       5. 📝 Creates order record (linked to user if authenticated/created)
 *       6. 🗑️ Clears the cart
 *       7. ✉️ Sends confirmation
 *       
 *       **Guest Account Creation**:
 *       - Set `createAccount: true` and provide `password`
 *       - User account will be created with email from customerInfo
 *       - Guest cart items will be transferred to new user account
 *       - Returns JWT token for immediate login
 *       
 *       **Security Features**:
 *       - Secure guest token handling
 *       - Optional user account creation
 *       - Order tracking for both guests and users
 *       - Cart transfer during account creation
 *     tags: [Orders]
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
 *           - **Guest**: `Bearer <guest-uuid>` for guest cart (UUID format)
 *           - **User**: `Bearer <jwt-token>` for authenticated user (JWT format)
 *           - **No header**: Creates new guest token automatically
 *           
 *           **Note**: In Swagger UI, paste only the token value (without "Bearer " prefix)
 *         example: "4fd8fc02-c372-4d4a-ba00-d1d9e9e93b2f"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerInfo
 *               - paymentInfo
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
 *                         description: City
 *                         example: "New York"
 *                       state:
 *                         type: string
 *                         description: State/Province
 *                         example: "NY"
 *                       zipCode:
 *                         type: string
 *                         description: ZIP/Postal code
 *                         example: "10001"
 *                       country:
 *                         type: string
 *                         description: Country
 *                         example: "USA"
 *               paymentInfo:
 *                 type: object
 *                 required:
 *                   - method
 *                   - transactionId
 *                 properties:
 *                   method:
 *                     type: string
 *                     enum: [credit_card, debit_card, paypal, stripe, apple_pay, google_pay, bank_transfer, cash_on_delivery]
 *                     description: Payment method used
 *                     example: "credit_card"
 *                   transactionId:
 *                     type: string
 *                     description: Payment gateway transaction ID
 *                     example: "txn_1234567890abcdef"
 *                   cardLastFour:
 *                     type: string
 *                     description: Last 4 digits of card (optional)
 *                     example: "1234"
 *                   cardBrand:
 *                     type: string
 *                     description: Card brand (optional)
 *                     example: "visa"
 *                   paymentGateway:
 *                     type: string
 *                     description: Payment gateway used (optional)
 *                     example: "stripe"
 *                   gatewayResponse:
 *                     type: object
 *                     description: Raw response from payment gateway (optional)
 *                     example: {"status": "succeeded", "receipt_url": "https://..."}
 *               promoCode:
 *                 type: string
 *                 description: Optional promotional code
 *                 example: "SAVE10"
 *               createAccount:
 *                 type: boolean
 *                 description: Create user account during checkout (guests only)
 *                 default: false
 *                 example: true
 *               password:
 *                 type: string
 *                 description: Password for account creation (required if createAccount is true)
 *                 minLength: 6
 *                 example: "securepassword123"
 *           examples:
 *             guestOrder:
 *               summary: Guest Order (No Account)
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
 *                     country: "USA"
 *                 paymentInfo:
 *                   method: "credit_card"
 *                   transactionId: "txn_1234567890abcdef"
 *                   cardLastFour: "1234"
 *                   cardBrand: "visa"
 *                   paymentGateway: "stripe"
 *                   gatewayResponse:
 *                     status: "succeeded"
 *                     receipt_url: "https://pay.stripe.com/receipts/..."
 *                 promoCode: "SAVE10"
 *                 createAccount: false
 *             guestOrderWithAccount:
 *               summary: Guest Order with Account Creation
 *               value:
 *                 customerInfo:
 *                   name: "Jane Smith"
 *                   email: "jane@example.com"
 *                   phone: "+1234567890"
 *                   address:
 *                     street: "456 Oak Ave"
 *                     city: "Los Angeles"
 *                     state: "CA"
 *                     zipCode: "90210"
 *                     country: "USA"
 *                 paymentInfo:
 *                   method: "paypal"
 *                   transactionId: "paypal_txn_987654321"
 *                   paymentGateway: "paypal"
 *                   gatewayResponse:
 *                     status: "COMPLETED"
 *                     payment_id: "PAYID-123456789"
 *                 promoCode: "WELCOME20"
 *                 createAccount: true
 *                 password: "securepassword123"
 *             userOrder:
 *               summary: Authenticated User Order
 *               value:
 *                 customerInfo:
 *                   name: "Bob Johnson"
 *                   email: "bob@example.com"
 *                   address:
 *                     street: "789 Pine St"
 *                     city: "Chicago"
 *                     state: "IL"
 *                     zipCode: "60601"
 *                     country: "USA"
 *                 paymentInfo:
 *                   method: "apple_pay"
 *                   transactionId: "apay_456789123def"
 *                   paymentGateway: "stripe"
 *                   gatewayResponse:
 *                     status: "succeeded"
 *                     payment_method: "pm_1234567890"
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
 *                     accountCreated:
 *                       type: boolean
 *                       description: Whether a new account was created
 *                       example: true
 *                     user:
 *                       type: object
 *                       description: User data (if account was created)
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                     token:
 *                       type: string
 *                       description: JWT token (if account was created)
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         headers:
 *           X-Guest-Token:
 *             description: New guest token (if none was provided)
 *             schema:
 *               type: string
 *       400:
 *         description: ❌ Bad request (cart empty, validation errors, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               emptyCart:
 *                 summary: Empty Cart
 *                 value:
 *                   error: "Cart is empty"
 *               passwordRequired:
 *                 summary: Password Required for Account Creation
 *                 value:
 *                   error: "Password is required when creating an account"
 *       409:
 *         description: ❌ Account already exists with this email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "An account with this email already exists. Please login instead."
 *       500:
 *         description: ❌ Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', guestOrAuth, ensureGuestToken, validate(createOrderSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { user, guestToken, isGuest } = req;
    
    // Determine if this is a user or guest order
    const isUserOrder = !!user;
    const userIdOrGuestToken = isUserOrder ? user!.id : guestToken!;
    
    const order = await orderService.createOrderForGuestOrUser(userIdOrGuestToken, req.body, isUserOrder);
    
    let message = 'Order created successfully';
    if (order.accountCreated) {
      message += ' and account created';
    }
    
    res.status(201).json({ 
      message,
      ...order 
    });
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
 *       - GuestToken: []
 *       - {}
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
 * /api/orders/analytics:
 *   get:
 *     summary: Get order analytics (admins only)
 *     description: |
 *       **ADMIN ONLY**: Get comprehensive order analytics and statistics.
 *       
 *       **Required**: Admin JWT token in Authorization header
 *       
 *       **Features**:
 *       - Total orders and revenue
 *       - Orders by status breakdown
 *       - Recent orders summary
 *       - Date range filtering
 *       
 *       **Use Cases**:
 *       - Dashboard analytics
 *       - Business reporting
 *       - Sales performance tracking
 *       - Order management insights
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics (YYYY-MM-DD)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: ✅ Order analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                   description: Total number of orders
 *                   example: 1250
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue amount
 *                   example: 125000.50
 *                 ordersByStatus:
 *                   type: object
 *                   description: Order count by status
 *                   example:
 *                     PENDING: 45
 *                     CONFIRMED: 120
 *                     PROCESSING: 80
 *                     SHIPPED: 200
 *                     DELIVERED: 750
 *                     CANCELLED: 35
 *                     REFUNDED: 20
 *                 recentOrders:
 *                   type: array
 *                   description: Recent orders summary
 *                   items:
 *                     $ref: '#/components/schemas/Order'
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
 *       500:
 *         description: ❌ Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

export default router;
