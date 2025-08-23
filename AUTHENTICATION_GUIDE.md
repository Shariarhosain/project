# Authentication System Guide

This API uses a flexible authentication system that supports three types of access:

## Authentication Types

### 1. **Admin Only** - `authenticateToken + requireAdmin`
- **Middleware**: `authenticateToken, requireAdmin`
- **Required**: Valid JWT token with admin role
- **Use for**: Administrative operations, user management, system configuration

**Example routes:**
```typescript
// Admin only - Create product
router.post('/', authenticateToken, requireAdmin, validate(createProductSchema), async (req, res, next) => {
  // Only admins can create products
});

// Admin only - Get all users  
router.get('/users', authenticateToken, requireAdmin, async (req, res, next) => {
  // Only admins can see all users
});
```

### 2. **User/Admin Access** - `authenticateToken + requireUser`
- **Middleware**: `authenticateToken, requireUser`
- **Required**: Valid JWT token with user or admin role
- **Use for**: User profile operations, orders, personal data

**Example routes:**
```typescript
// User/Admin - View profile
router.get('/profile', authenticateToken, requireUser, async (req, res, next) => {
  // Both users and admins can access this
});

// User/Admin - Create order
router.post('/orders', authenticateToken, requireUser, async (req, res, next) => {
  // Both users and admins can create orders
});
```

### 3. **Guest/User/Admin Access** - `guestOrAuth + ensureGuestToken`
- **Middleware**: `guestOrAuth, ensureGuestToken`
- **Required**: Either a valid JWT token OR a guest token (UUID)
- **Use for**: Shopping cart, browsing with personalization

**Example routes:**
```typescript
// Guest/User/Admin - Shopping cart
router.get('/carts', guestOrAuth, ensureGuestToken, async (req, res, next) => {
  if (req.user) {
    // User is authenticated - use user cart
    cart = await cartService.getOrCreateCart(undefined, req.user.id);
  } else {
    // Guest user - use guest token
    cart = await cartService.getOrCreateCart(req.guestToken);
  }
});
```

### 4. **Public Access** - No authentication middleware
- **Middleware**: None (or `optionalAuth` if you want to detect authenticated users)
- **Required**: No authentication
- **Use for**: Public product listings, general information

**Example routes:**
```typescript
// Public - Get products (no auth required)
router.get('/products', validate(productQuerySchema), async (req, res, next) => {
  // Anyone can view products
});

// Public with optional auth - Get products with personalization
router.get('/products', optionalAuth, validate(productQuerySchema), async (req, res, next) => {
  // Anyone can view products, but logged-in users get personalized results
  const isAuthenticated = !!req.user;
});
```

## Token Types

### JWT Tokens (User/Admin)
- **Format**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Contains**: User ID, email, name, role
- **Obtained**: Login endpoint (`POST /api/users/login`)
- **Validation**: Cryptographically signed and verified

### Guest Tokens
- **Format**: `Bearer 123e4567-e89b-12d3-a456-426614174000` (UUID)
- **Contains**: Random UUID for cart persistence
- **Obtained**: Automatically generated on first cart interaction
- **Validation**: UUID format check

## How the System Prevents Token Regeneration

The improved system now:

1. **Accepts existing guest tokens**: If you provide a valid guest token, it will be used
2. **Only generates new tokens when needed**: New guest tokens are only created if none is provided
3. **Returns new tokens in headers**: When a new guest token is generated, it's returned in the `X-Guest-Token` header
4. **Preserves user sessions**: JWT tokens are always respected and never replaced

## Client Implementation

### For Web/Mobile Apps:

```javascript
// 1. Check if user is logged in
if (userToken) {
  // Use JWT token for authenticated requests
  headers.Authorization = `Bearer ${userToken}`;
} else if (guestToken) {
  // Use existing guest token
  headers.Authorization = `Bearer ${guestToken}`;
} else {
  // Let server generate guest token
  // Check response headers for X-Guest-Token
}

// 2. Handle guest token from response
const response = await fetch('/api/carts', { headers });
const newGuestToken = response.headers.get('X-Guest-Token');
if (newGuestToken) {
  // Store the new guest token for future requests
  localStorage.setItem('guestToken', newGuestToken);
}
```

## Route Categories by Authentication

### Admin Only Routes:
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/users` - List all users
- `DELETE /api/users/:id` - Delete user
- `POST /api/promos` - Create promo
- `PUT /api/promos/:id` - Update promo
- `DELETE /api/promos/:id` - Delete promo

### User/Admin Routes:
- `GET /api/users/profile` - View own profile
- `PUT /api/users/:id` - Update profile (own or admin can update any)
- `POST /api/orders` - Create order
- `GET /api/orders` - View orders (own or admin sees all)
- `GET /api/orders/:id` - View order details

### Guest/User/Admin Routes:
- `GET /api/carts` - Get cart
- `POST /api/carts/items` - Add to cart
- `PUT /api/carts/items/:id` - Update cart item
- `DELETE /api/carts/items/:id` - Remove cart item
- `POST /api/carts/clear` - Clear cart

### Public Routes:
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/promos` - List active promos (public view)

## Testing with Swagger/Postman

### For Admin Operations:
1. Login as admin: `POST /api/users/login`
2. Copy the JWT token from response
3. Use token with `Bearer` prefix: `Bearer eyJhbGciOiJIUzI1NiIs...`

### For Guest Operations:
1. Make any cart request without token
2. Check response headers for `X-Guest-Token`
3. Use the guest token for subsequent requests: `Bearer 123e4567-e89b-12d3-a456-426614174000`

### For User Operations:
1. Register: `POST /api/users/register`
2. Login: `POST /api/users/login`
3. Use the JWT token: `Bearer eyJhbGciOiJIUzI1NiIs...`
