# 🛒 Headless E-commerce Backend API

A modern, **guest-first** e-commerce backend built with **Node.js**, **TypeScript**, **Express**, **Prisma**, and **MongoDB**. This API prioritizes immediate shopping experiences without registration barriers, while providing comprehensive management tools for registered users and administrators.

## 🌐 **Live API Server**
**Production API**: https://project-production-75d9.up.railway.app/  
**Live Documentation**: https://project-production-75d9.up.railway.app/api-docs

### **🚀 Quick Test the Live API**
You can immediately test the live API without any setup:

```bash
# Test 1: Browse products (no auth required)
curl https://project-production-75d9.up.railway.app/api/products

# Test 2: Create a guest cart (no auth required)
curl https://project-production-75d9.up.railway.app/api/carts

# Test 3: View promotions (no auth required)  
curl https://project-production-75d9.up.railway.app/api/promos
```

**Try it in your browser:**
- **Products**: https://project-production-75d9.up.railway.app/api/products
- **Promotions**: https://project-production-75d9.up.railway.app/api/promos
- **Interactive Docs**: https://project-production-75d9.up.railway.app/api-docs

## 🌊 System Flow Diagrams

### 🎭 **Guest User Flow** (Priority #1 - No Registration Required)

```mermaid
graph TD
    A[🌐 Guest Visitor] --> B[📦 Browse Products]
    B --> B1[GET /api/products]
    B1 --> B2[🔍 Search & Filter]
    B2 --> C{Want to Shop?}
    
    C -->|Yes| D[🛒 Get Cart]
    C -->|Just Browsing| B2
    
    D --> D1[GET /api/carts]
    D1 --> D2[🎟️ Receive Guest Token]
    D2 --> E[➕ Add Items to Cart]
    
    E --> E1[POST /api/carts/items]
    E1 --> E2[✏️ Update Quantities]
    E2 --> E3[PUT /api/carts/items/:id]
    E3 --> F{Apply Promo?}
    
    F -->|Yes| G[🎫 Apply Promotion]
    F -->|No| H[💳 Checkout]
    
    G --> G1[POST /api/promos/apply]
    G1 --> G2[💰 See Discount Applied]
    G2 --> H
    
    H --> H1[POST /api/orders]
    H1 --> H2[📋 Enter Customer Info]
    H2 --> I[✅ Order Created]
    I --> I1[📧 Order Confirmation]
    I1 --> J[📱 Track with Order Number]
    
    style A fill:#e1f5fe
    style D2 fill:#fff3e0
    style I fill:#e8f5e8
```

### 👤 **Registered User Flow** (Enhanced Experience)

```mermaid
graph TD
    A[👤 Returning User] --> B{Already Registered?}
    
    B -->|No| C[📝 Register Account]
    B -->|Yes| D[🔐 Login]
    
    C --> C1[POST /api/users/register]
    C1 --> C2[📧 Account Created]
    C2 --> D
    
    D --> D1[POST /api/users/login]
    D1 --> D2[🎟️ Receive JWT Token]
    D2 --> E[🏠 User Dashboard]
    
    E --> F{What to do?}
    
    F -->|Shop| G[📦 Browse Products]
    F -->|View Orders| H[📋 Order History]
    F -->|Manage Profile| I[👤 Account Settings]
    
    G --> G1[GET /api/products]
    G1 --> G2[🛒 Get Persistent Cart]
    G2 --> G3[GET /api/carts + JWT]
    G3 --> G4[🔄 Cart Synced Across Devices]
    G4 --> J[➕ Add Items]
    
    H --> H1[GET /api/orders]
    H1 --> H2[📊 View Purchase History]
    H2 --> H3[🔍 Track Order Status]
    
    I --> I1[GET /api/users/me]
    I1 --> I2[✏️ Update Profile]
    I2 --> I3[PUT /api/users/me]
    
    J --> K[💳 Enhanced Checkout]
    K --> K1[🚀 Faster Process]
    K1 --> K2[💾 Saved Customer Info]
    K2 --> L[✅ Order Placed]
    
    style A fill:#e8eaf6
    style D2 fill:#e3f2fd
    style G4 fill:#e8f5e8
    style K1 fill:#fff3e0
```

### 👑 **Admin User Flow** (Complete System Management)

```mermaid
graph TD
    A[👑 Admin User] --> B[🔐 Admin Login]
    B --> B1[POST /api/users/login]
    B1 --> B2[🛡️ Verify Admin Role]
    B2 --> C[🏢 Admin Dashboard]
    
    C --> D{Management Area}
    
    D -->|Products| E[📦 Product Management]
    D -->|Orders| F[📋 Order Management]  
    D -->|Users| G[👥 User Management]
    D -->|Promos| H[🎫 Promotion Management]
    D -->|Analytics| I[📊 Reports & Analytics]
    
    E --> E1{Product Actions}
    E1 -->|Create| E2[POST /api/products]
    E1 -->|Update| E3[PUT /api/products/:id]
    E1 -->|Delete| E4[DELETE /api/products/:id]
    E1 -->|View All| E5[GET /api/products?includeInactive=true]
    E2 --> E6[🎨 Manage Variants]
    E6 --> E7[📊 Update Inventory]
    
    F --> F1{Order Actions}
    F1 -->|View All| F2[GET /api/orders]
    F1 -->|Update Status| F3[PATCH /api/orders/:id/status]
    F1 -->|Fulfill| F4[📦 Process Shipment]
    F2 --> F5[🔍 Filter & Search Orders]
    F3 --> F6[📧 Notify Customer]
    
    G --> G1{User Actions}
    G1 -->|View All| G2[GET /api/users]
    G1 -->|Create| G3[POST /api/users]
    G1 -->|Update| G4[PUT /api/users/:id]
    G1 -->|Delete| G5[DELETE /api/users/:id]
    G2 --> G6[👥 Manage Roles & Permissions]
    
    H --> H1{Promotion Actions}
    H1 -->|Create| H2[POST /api/promos]
    H1 -->|Update| H3[PUT /api/promos/:id]
    H1 -->|Delete| H4[DELETE /api/promos/:id]
    H1 -->|Analytics| H5[📈 Track Usage]
    H2 --> H6[🎯 Set Conditions & Limits]
    
    I --> I1[📊 Sales Reports]
    I1 --> I2[👥 User Statistics]
    I2 --> I3[📦 Inventory Levels]
    I3 --> I4[💰 Revenue Analytics]
    I4 --> I5[🎫 Promotion Performance]
    
    style A fill:#fce4ec
    style B2 fill:#ffebee
    style C fill:#f3e5f5
    style E7 fill:#e8f5e8
    style F6 fill:#fff3e0
    style G6 fill:#e3f2fd
    style H6 fill:#fff9c4
    style I5 fill:#e0f2f1
```

### 🔄 **Complete System Integration Flow**

```mermaid
graph TB
    subgraph "🎭 Guest Layer"
        A1[Browse Products] --> A2[Add to Cart]
        A2 --> A3[Apply Promos]
        A3 --> A4[Checkout]
    end
    
    subgraph "👤 User Layer"  
        B1[Login/Register] --> B2[Persistent Cart]
        B2 --> B3[Order History]
        B3 --> B4[Account Management]
    end
    
    subgraph "👑 Admin Layer"
        C1[Product Management] --> C2[Order Processing]
        C2 --> C3[User Management]
        C3 --> C4[Analytics]
    end
    
    subgraph "🗄️ Database Layer"
        D1[(Products)] --> D2[(Carts)]
        D2 --> D3[(Orders)]
        D3 --> D4[(Users)]
        D4 --> D5[(Promos)]
    end
    
    subgraph "🔒 Security Layer"
        E1[Guest Tokens] --> E2[JWT Auth]
        E2 --> E3[Role-based Access]
        E3 --> E4[Input Validation]
    end
    
    A4 --> D3
    B2 --> D2
    C1 --> D1
    C2 --> D3
    C3 --> D4
    
    E1 --> A2
    E2 --> B1
    E3 --> C1
    
    style A1 fill:#e1f5fe
    style B1 fill:#e8eaf6
    style C1 fill:#fce4ec
    style D1 fill:#f1f8e9
    style E1 fill:#fff3e0
```

## 🎯 System Overview

### **Core Philosophy: Guest-First Shopping**
This headless e-commerce backend is designed with **guests as the primary focus**, enabling immediate shopping experiences:

- 🎭 **Guest Priority**: Browse, cart, and purchase without any registration barriers
- 🔍 **Instant Access**: Product catalog, cart management, and checkout available immediately
- � **Seamless Shopping**: Secure guest tokens for persistent cart sessions
- 🎫 **Smart Promotions**: Apply discount codes without account requirements
- 📋 **Quick Checkout**: Convert carts to orders with minimal customer information
- 🔐 **Optional Registration**: Enhanced features for users who choose to register
- � **Admin Control**: Complete backend management for business operations

### **System Capabilities**
- ✅ **Zero-friction guest shopping** - Start shopping instantly
- ✅ **Persistent guest carts** - Secure tokens maintain cart across sessions
- ✅ **Smart product catalog** - Variants, pricing, inventory, search, filtering
- ✅ **Flexible promotion system** - Percentage and fixed discounts with conditions
- ✅ **Order management** - Guest and user orders with status tracking
- ✅ **User authentication** - JWT-based security for enhanced features
- ✅ **Admin dashboard** - Complete backend control and analytics
- ✅ **Comprehensive API docs** - Interactive Swagger documentation
- ✅ **Error handling** - Consistent, informative error responses

## 🏗️ Technical Architecture

### **Tech Stack**
- **Backend**: Node.js + TypeScript + Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT tokens for users, UUID tokens for guests
- **Documentation**: Swagger/OpenAPI 3.0 with comprehensive error schemas
- **Validation**: Zod schemas with middleware
- **Security**: Helmet, CORS, bcrypt password hashing, role-based access control

### **Database Schema**
```
👤 Users ↔ 🛒 Carts ↔ 📦 CartItems ↔ 🏷️ Products
    ↓         ↓           ↓             ↓
📋 Orders → 📋 OrderItems → 🎨 ProductVariants
    ↓
🎫 Promos
```

### **API Error Handling**
Our API provides consistent, informative error responses with proper HTTP status codes:

#### **Error Response Format**
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error description",
  "details": {
    "field": "specific_field",
    "code": "validation_code"
  }
}
```

#### **HTTP Status Codes**
- `200` - Success with data
- `201` - Resource created successfully  
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (duplicate resource)
- `422` - Validation failed
- `500` - Internal server error

#### **Common Error Types**
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid credentials
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource doesn't exist
- `DUPLICATE_ERROR` - Resource already exists
- `CART_ERROR` - Cart operation failed
- `ORDER_ERROR` - Order processing failed
- `PROMO_ERROR` - Promotion application failed

## 🌊 Three-Step Flow for Three User Roles

### 🎭 **STEP 1: GUEST USER FLOW** (Priority #1)
*No registration required - immediate shopping experience*

#### **Step 1A: Product Discovery**
```http
GET https://project-production-75d9.up.railway.app/api/products
```
**What guests can do:**
- ✅ Browse complete product catalog
- ✅ Search by name, category, price range  
- ✅ View product details, variants (sizes/colors), pricing
- ✅ Check real-time stock availability
- ✅ Filter and paginate results
- ❌ **No authentication needed** - zero barriers

**Example Response:**
```json
{
  "products": [
    {
      "id": "64f7b1c2e4b0c1d2e3f4g5h6",
      "name": "Classic T-Shirt",
      "slug": "classic-t-shirt",
      "price": 19.99,
      "variants": [
        {"id": "var1", "size": "M", "color": "Blue", "stock": 25},
        {"id": "var2", "size": "L", "color": "Red", "stock": 18}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### **Step 1B: Cart Creation & Management**
```http
# Get or create guest cart
GET https://project-production-75d9.up.railway.app/api/carts
```
**System automatically:**
- ✅ Creates secure guest cart (no registration)
- ✅ Returns guest token in `X-Guest-Token` header
- ✅ Token persists cart across browser sessions
- ✅ Cart expires after configurable time period

```http
# Add products to cart
POST https://project-production-75d9.up.railway.app/api/carts/items
Authorization: Bearer <guest-token>
Content-Type: application/json

{
  "variantId": "64f7b1c2e4b0c1d2e3f4g5h7",
  "quantity": 2
}
```

**Cart operations available:**
- ✅ Add specific product variants
- ✅ Update quantities with real-time validation
- ✅ Remove individual items
- ✅ Clear entire cart
- ✅ Automatic price calculations
- ✅ Stock availability checks

#### **Step 1C: Checkout & Order Creation**
```http
# Apply promotion (optional)
POST https://project-production-75d9.up.railway.app/api/promos/apply
Authorization: Bearer <guest-token>
{
  "promoCode": "WELCOME10"
}

# Create order
POST https://project-production-75d9.up.railway.app/api/orders
Authorization: Bearer <guest-token>
{
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "address": {
      "street": "123 Main Street",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "US"
    }
  }
}
```

**Checkout features:**
- ✅ Apply discount codes without registration
- ✅ Minimal customer information required
- ✅ Convert cart to order instantly
- ✅ Generate unique order number
- ✅ Order confirmation via email
- ✅ Track order with order number

### 👤 **STEP 2: REGISTERED USER FLOW**
*Enhanced features for users who choose to register*

#### **Step 2A: User Authentication**
```http
# User Registration (Optional)
POST https://project-production-75d9.up.railway.app/api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "Jane Smith"
}

# User Login
POST https://project-production-75d9.up.railway.app/api/users/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "securepassword"
}
```

**Authentication benefits:**
- ✅ Receive JWT token for authenticated requests
- ✅ Access to enhanced features and user dashboard
- ✅ Persistent account across devices
- ✅ Order history and tracking

**Success Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f7b1c2e4b0c1d2e3f4g5h8",
    "email": "user@example.com",
    "name": "Jane Smith",
    "role": "USER"
  }
}
```

#### **Step 2B: Enhanced Cart & Order Management**
```http
# Get user's persistent cart
GET https://project-production-75d9.up.railway.app/api/carts
Authorization: Bearer <jwt-token>

# View order history
GET https://project-production-75d9.up.railway.app/api/orders
Authorization: Bearer <jwt-token>

# Track specific order
GET https://project-production-75d9.up.railway.app/api/orders/:id
Authorization: Bearer <jwt-token>
```

**Registered user advantages:**
- ✅ **Persistent cart** across all devices and sessions
- ✅ **Order history** - view all past purchases
- ✅ **Order tracking** - detailed status updates
- ✅ **Saved preferences** - faster checkout process
- ✅ **Account management** - update profile information
- ✅ **Enhanced support** - linked customer service

#### **Step 2C: User Account Management**
```http
# Get user profile
GET https://project-production-75d9.up.railway.app/api/users/me
Authorization: Bearer <jwt-token>

# Update profile
PUT https://project-production-75d9.up.railway.app/api/users/me
Authorization: Bearer <jwt-token>
{
  "name": "Jane Smith Updated",
  "email": "new@example.com"
}
```

**Profile features:**
- ✅ Update personal information
- ✅ Change password securely
- ✅ View account statistics
- ✅ Download order history

### 👑 **STEP 3: ADMIN USER FLOW**
*Complete backend management and business operations*

#### **Step 3A: Admin Authentication & Access**
```http
# Admin Login
POST https://project-production-75d9.up.railway.app/api/users/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Admin capabilities:**
- ✅ Full system access with ADMIN role
- ✅ Manage all products, orders, users, and promotions
- ✅ Access to analytics and reporting
- ✅ System configuration and monitoring

#### **Step 3B: Product & Inventory Management**
```http
# Create new product
POST https://project-production-75d9.up.railway.app/api/products
Authorization: Bearer <admin-jwt>
{
  "name": "New Product",
  "description": "Product description",
  "price": 29.99,
  "categoryId": "cat123",
  "variants": [
    {"size": "M", "color": "Blue", "stock": 50, "sku": "PROD-M-BLU"}
  ]
}

# Update product
PUT https://project-production-75d9.up.railway.app/api/products/:id
Authorization: Bearer <admin-jwt>

# Delete product  
DELETE https://project-production-75d9.up.railway.app/api/products/:id
Authorization: Bearer <admin-jwt>

# View all products (including inactive)
GET https://project-production-75d9.up.railway.app/api/products?includeInactive=true
Authorization: Bearer <admin-jwt>
```

**Product management features:**
- ✅ Create products with multiple variants
- ✅ Manage inventory and stock levels
- ✅ Set pricing and promotional pricing
- ✅ Upload and manage product images
- ✅ SEO optimization (slugs, meta data)
- ✅ Category and tag management

#### **Step 3C: Order & Business Management**
```http
# View all orders with filters
GET https://project-production-75d9.up.railway.app/api/orders?status=PENDING&startDate=2024-01-01
Authorization: Bearer <admin-jwt>

# Update order status
PATCH https://project-production-75d9.up.railway.app/api/orders/:id/status
Authorization: Bearer <admin-jwt>
{
  "status": "SHIPPED",
  "trackingNumber": "1Z999AA1234567890"
}

# Create promotion
POST https://project-production-75d9.up.railway.app/api/promos
Authorization: Bearer <admin-jwt>
{
  "code": "SUMMER25",
  "type": "PERCENTAGE", 
  "value": 25,
  "minOrderValue": 75,
  "maxDiscount": 50,
  "expiresAt": "2024-09-30T23:59:59.000Z"
}

# User management
GET https://project-production-75d9.up.railway.app/api/users
POST https://project-production-75d9.up.railway.app/api/users
PUT https://project-production-75d9.up.railway.app/api/users/:id
DELETE https://project-production-75d9.up.railway.app/api/users/:id
Authorization: Bearer <admin-jwt>
```

**Admin management features:**
- ✅ **Order Management**: View, update, fulfill all orders
- ✅ **User Management**: Create, update, delete user accounts
- ✅ **Promotion Management**: Create and manage discount codes
- ✅ **Analytics Dashboard**: Sales reports, user statistics
- ✅ **Inventory Control**: Stock levels, low stock alerts
- ✅ **System Monitoring**: API performance, error tracking
## 📚 Complete API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Access Level | Error Codes |
|--------|----------|-------------|--------------|-------------|
| `POST` | `/api/users/login` | User login - get JWT token | Public | `400`, `401`, `422` |
| `POST` | `/api/users/register` | User registration | Public | `400`, `409`, `422` |
| `GET` | `/api/users/me` | Get current user profile | User/Admin | `401`, `403` |

**Authentication Error Examples:**
```json
// Invalid credentials (401)
{
  "error": "AUTHENTICATION_ERROR",
  "message": "Invalid email or password"
}

// Email already exists (409)
{
  "error": "DUPLICATE_ERROR", 
  "message": "User with this email already exists"
}
```

### 📦 Product Endpoints

| Method | Endpoint | Description | Access Level | Error Codes |
|--------|----------|-------------|--------------|-------------|
| `GET` | `/api/products` | Browse products with filters | Public | `400`, `500` |
| `GET` | `/api/products/:id` | Get product by ID | Public | `404` |
| `GET` | `/api/products/slug/:slug` | Get product by slug | Public | `404` |
| `POST` | `/api/products` | Create new product | Admin | `401`, `403`, `422` |
| `PUT` | `/api/products/:id` | Update product | Admin | `401`, `403`, `404`, `422` |
| `DELETE` | `/api/products/:id` | Delete product | Admin | `401`, `403`, `404` |

**Product Error Examples:**
```json
// Product not found (404)
{
  "error": "NOT_FOUND",
  "message": "Product not found"
}

// Validation error (422)
{
  "error": "VALIDATION_ERROR",
  "message": "Price must be a positive number",
  "details": {
    "field": "price",
    "code": "invalid_type"
  }
}
```

### 🛒 Cart Endpoints

| Method | Endpoint | Description | Access Level | Error Codes |
|--------|----------|-------------|--------------|-------------|
| `GET` | `/api/carts` | Get or create cart | Guest/User | `401` |
| `POST` | `/api/carts/items` | Add item to cart | Guest/User | `400`, `401`, `404`, `422` |
| `PUT` | `/api/carts/items/:itemId` | Update cart item | Guest/User | `401`, `404`, `422` |
| `DELETE` | `/api/carts/items/:itemId` | Remove cart item | Guest/User | `401`, `404` |
| `POST` | `/api/carts/clear` | Clear entire cart | Guest/User | `401` |

**Cart Error Examples:**
```json
// Insufficient stock (400)
{
  "error": "CART_ERROR",
  "message": "Insufficient stock for this item",
  "details": {
    "requested": 5,
    "available": 2
  }
}

// Cart item not found (404)
{
  "error": "NOT_FOUND",
  "message": "Cart item not found"
}
```

### 🎫 Promotion Endpoints

| Method | Endpoint | Description | Access Level | Error Codes |
|--------|----------|-------------|--------------|-------------|
| `GET` | `/api/promos` | List active promotions | Public | `500` |
| `POST` | `/api/promos/apply` | Apply promo to cart | Guest/User | `400`, `401`, `404` |
| `GET` | `/api/promos/:code/validate` | Validate promo code | Public | `404` |
| `POST` | `/api/promos` | Create promotion | Admin | `401`, `403`, `409`, `422` |
| `PUT` | `/api/promos/:id` | Update promotion | Admin | `401`, `403`, `404`, `422` |
| `DELETE` | `/api/promos/:id` | Delete promotion | Admin | `401`, `403`, `404` |

**Promotion Error Examples:**
```json
// Promo code expired (400)
{
  "error": "PROMO_ERROR",
  "message": "Promotion code has expired"
}

// Minimum order not met (400)
{
  "error": "PROMO_ERROR",
  "message": "Order must be at least $50 to use this promotion",
  "details": {
    "minOrderValue": 50,
    "currentOrderValue": 35
  }
}
```

### 📋 Order Endpoints

| Method | Endpoint | Description | Access Level | Error Codes |
|--------|----------|-------------|--------------|-------------|
| `POST` | `/api/orders` | Create order from cart | Guest/User | `400`, `401`, `422` |
| `GET` | `/api/orders` | Get user's orders (or all for admin) | User/Admin | `401`, `403` |
| `GET` | `/api/orders/:id` | Get order details | User/Admin | `401`, `403`, `404` |
| `GET` | `/api/orders/number/:orderNumber` | Get order by number | Guest/User | `404` |
| `PATCH` | `/api/orders/:id/status` | Update order status | Admin | `401`, `403`, `404`, `422` |

**Order Error Examples:**
```json
// Empty cart (400)
{
  "error": "ORDER_ERROR",
  "message": "Cannot create order from empty cart"
}

// Invalid order status (422)
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid order status transition",
  "details": {
    "currentStatus": "SHIPPED",
    "requestedStatus": "PENDING"
  }
}
```

### 👥 User Management Endpoints

| Method | Endpoint | Description | Access Level | Error Codes |
|--------|----------|-------------|--------------|-------------|
| `GET` | `/api/users` | Get all users | Admin | `401`, `403` |
| `GET` | `/api/users/:id` | Get user by ID | Admin | `401`, `403`, `404` |
| `POST` | `/api/users` | Create new user | Admin | `401`, `403`, `409`, `422` |
| `PUT` | `/api/users/:id` | Update user | Admin | `401`, `403`, `404`, `422` |
| `DELETE` | `/api/users/:id` | Delete user | Admin | `401`, `403`, `404` |

**User Management Error Examples:**
```json
// Insufficient permissions (403)
{
  "error": "AUTHORIZATION_ERROR",
  "message": "Insufficient permissions to access this resource"
}

// User not found (404)
{
  "error": "NOT_FOUND",
  "message": "User not found"
}
```
## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** installed
- **MongoDB** database (local or cloud)
- **Git** for version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/ecommerce"
   # or MongoDB Atlas: "mongodb+srv://username:password@cluster.mongodb.net/ecommerce"
   
   # Security
   JWT_SECRET="your-super-secret-jwt-key-here-min-32-chars"
   
   # Server
   PORT=3000
   NODE_ENV=development
   
   # CORS (optional)
   CORS_ORIGIN="http://localhost:3000"
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Push schema to database  
   npm run prisma:push
   
   # Seed with sample data
   npm run prisma:seed
   ```

5. **Start the server**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

6. **Access the API**
   - **Local Development**: http://localhost:3000
   - **Production API**: https://project-production-75d9.up.railway.app/
   - **Live Documentation**: https://project-production-75d9.up.railway.app/api-docs
   - **Local Swagger**: http://localhost:3000/api-docs
   - **Prisma Studio**: `npm run prisma:studio`

## 🎯 Sample Data (After Seeding)

### **Test Users**
```json
{
  "admin": {
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN"
  },
  "user": {
    "email": "john@example.com", 
    "password": "john123",
    "role": "USER"
  }
}
```

### **Sample Products**
- **Classic T-Shirt** (Multiple sizes/colors) - $19.99
- **Wireless Headphones** (Black/White) - $129.99  
- **Coffee Mug** (Various colors) - $12.99
- **Smartphone Case** (iPhone/Samsung) - $22.99-$24.99
- **Running Shoes** (Multiple sizes/colors) - $89.99

### **Active Promo Codes**
- `WELCOME10` - 10% off orders over $50 (max $20 discount)
- `SAVE20` - $20 off orders over $100
- `SUMMER25` - 25% off orders over $75 (max $50 discount)  
- `FREESHIP` - $9.99 off orders over $25

## 🔒 Security & Error Handling

### **Security Features**
- ✅ **Input Validation**: Zod schemas for all endpoints
- ✅ **Authentication**: JWT tokens with expiration
- ✅ **Authorization**: Role-based access control (USER/ADMIN)
- ✅ **Guest Security**: Secure UUID tokens for cart sessions
- ✅ **Password Hashing**: Bcrypt with salt rounds
- ✅ **CORS Protection**: Configurable cross-origin policies
- ✅ **Rate Limiting**: Protection against abuse
- ✅ **Helmet Security**: HTTP headers protection

### **Comprehensive Error Handling**
All API endpoints return consistent error responses with appropriate HTTP status codes:

#### **Validation Errors (400/422)**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "body.email: Invalid email format",
  "details": {
    "field": "email",
    "code": "invalid_string"
  }
}
```

#### **Authentication Errors (401)**
```json
{
  "error": "AUTHENTICATION_ERROR", 
  "message": "Invalid or expired token"
}
```

#### **Authorization Errors (403)**
```json
{
  "error": "AUTHORIZATION_ERROR",
  "message": "Insufficient permissions to access this resource"
}
```

#### **Not Found Errors (404)**
```json
{
  "error": "NOT_FOUND",
  "message": "Product not found"
}
```

#### **Business Logic Errors (400)**
```json
{
  "error": "CART_ERROR",
  "message": "Insufficient stock for this item",
  "details": {
    "requested": 5,
    "available": 2,
    "productId": "64f7b1c2e4b0c1d2e3f4g5h6"
  }
}
```

### **Error Handling in Swagger Documentation**
Our Swagger/OpenAPI documentation includes comprehensive error schemas for each endpoint:

- **Error response examples** for each HTTP status code
- **Detailed error codes** and their meanings  
- **Request/response validation schemas**
- **Interactive testing** with proper error handling
- **Authentication examples** for different user roles

## 📊 Key Features Summary

### **🎭 Guest-First Design**
- ✅ **Zero barriers** - shop immediately without registration
- ✅ **Secure guest tokens** - persistent cart sessions
- ✅ **Full shopping experience** - browse, cart, checkout, order tracking
- ✅ **Optional registration** - enhanced features when desired

### **📦 Advanced Product System**
- ✅ **Product variants** - sizes, colors, different pricing
- ✅ **Real-time inventory** - stock validation and management
- ✅ **Smart search** - filtering, pagination, sorting
- ✅ **SEO optimization** - slugs, meta data, structured data

### **🎫 Intelligent Promotion Engine**
- ✅ **Flexible discounts** - percentage and fixed amount
- ✅ **Smart conditions** - minimum order, usage limits, expiration
- ✅ **Stackable promotions** - multiple promo support
- ✅ **Usage tracking** - analytics and reporting

### **📋 Robust Order Management**
- ✅ **Guest and user orders** - unified system
- ✅ **Status tracking** - real-time updates
- ✅ **Order history** - searchable and filterable
- ✅ **Customer communication** - email notifications

### **👑 Complete Admin Dashboard**
- ✅ **Product management** - CRUD operations, inventory
- ✅ **Order processing** - status updates, fulfillment
- ✅ **User management** - accounts, roles, permissions  
- ✅ **Analytics** - sales reports, performance metrics
## 🧪 Testing & Development

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch

# Run specific test file
npm test -- products.test.js

# Run tests with coverage
npm run test:coverage
```

### **Development Tools**
```bash
# Start development server with hot reload
npm run dev

# View database with Prisma Studio
npm run prisma:studio

# Reset database (development only)
npm run prisma:reset

# View API documentation
# http://localhost:3000/api-docs
```

### **Database Management**
```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Push schema changes to database
npm run prisma:push

# Create and apply migrations (production)
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

## 📈 Production Deployment

### **Environment Variables**
```env
# Production environment
NODE_ENV=production
PORT=3000

# Secure database connection
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# Strong JWT secret (min 32 characters)
JWT_SECRET=your-super-secure-production-jwt-secret-key

# Frontend domain for CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Build & Deploy Commands**
```bash
# Install production dependencies only
npm ci --only=production

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start dist/app.js --name ecommerce-api
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Ensure all tests pass (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

### **Code Standards**
- ✅ **TypeScript** - Strict type checking enabled
- ✅ **ESLint** - Code linting and formatting
- ✅ **Prettier** - Consistent code formatting  
- ✅ **Zod** - Runtime type validation
- ✅ **Jest** - Unit and integration testing
- ✅ **Swagger** - API documentation

### **Commit Guidelines**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions/modifications
- `refactor:` - Code refactoring
- `style:` - Code formatting changes

## � Support & Resources

### **Documentation**
- 📚 **Live API Documentation**: https://project-production-75d9.up.railway.app/api-docs
- 📚 **Local API Documentation**: http://localhost:3000/api-docs
- 🔧 **Prisma Schema**: [./prisma/schema.prisma](./prisma/schema.prisma)
- 📋 **Project Summary**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- 🔐 **Authentication Guide**: [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)

### **Quick Links**
- **Live Production API**: https://project-production-75d9.up.railway.app/
- **Swagger UI**: Interactive API testing interface
- **Prisma Studio**: Visual database management
- **GitHub Issues**: Bug reports and feature requests
- **MongoDB Atlas**: Cloud database hosting

### **Contact**
- **Email**: shariarhosain131529@gmail.com
- **Repository**: GitHub repository link
- **Issues**: GitHub Issues page

---

## 🎯 Summary

This **guest-first headless e-commerce backend** is designed to provide:

### **🎭 For Guests** (Priority #1)
- **Instant shopping** without any barriers
- **Secure cart management** with persistent tokens  
- **Complete checkout process** with minimal information
- **Order tracking** via order number

### **👤 For Registered Users**
- **Enhanced features** with persistent accounts
- **Order history** and tracking across devices
- **Faster checkout** with saved information
- **Account management** and preferences

### **👑 For Administrators**  
- **Complete backend control** for business operations
- **Product and inventory management** with variants
- **Order processing** and fulfillment tools
- **User and promotion management** with analytics

**Built with modern technologies, comprehensive error handling, extensive API documentation, and a security-first approach - this backend provides everything needed to power exceptional shopping experiences.** 🛍️✨
