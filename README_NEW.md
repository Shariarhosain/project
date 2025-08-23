# 🛒 Headless E-commerce Backend API

A modern, guest-first e-commerce backend built with **Node.js**, **TypeScript**, **Express**, **Prisma**, and **MongoDB**. This API enables customers to browse products, manage shopping carts, apply promotions, and complete orders without requiring user registration.

## 🎯 System Overview

This headless e-commerce backend provides:

- 🔍 **Product Catalog**: Browse products with variants, pricing, and inventory management
- 🛍️ **Guest Shopping**: No registration required - secure cart tokens for immediate shopping
- 🛒 **Smart Cart Management**: Add, update, remove items with automatic calculations
- 🎫 **Promotional System**: Apply discount codes (percentage or fixed amount)
- 📋 **Order Processing**: Convert carts to orders with customer details and tracking
- 🔐 **User Authentication**: JWT-based auth for registered users and admins
- 👑 **Admin Management**: Complete backend tools for managing the entire system

## 🏗️ Technical Architecture

### **Tech Stack**
- **Backend**: Node.js + TypeScript + Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT tokens for users, UUID tokens for guests
- **Documentation**: Swagger/OpenAPI 3.0
- **Validation**: Zod schemas with middleware
- **Security**: Helmet, CORS, bcrypt password hashing

### **Database Schema**
```
Users ↔ Carts ↔ CartItems ↔ Products
  ↓       ↓         ↓          ↓
Orders → OrderItems → ProductVariants
  ↓
Promos
```

## 🌊 System Flow Chart

```mermaid
graph TD
    A[🌐 Frontend/Client] --> B{User Type?}
    
    B -->|Guest User| C[🎭 Guest Mode]
    B -->|Registered User| D[🔐 Login Required]
    B -->|Admin User| E[👑 Admin Access]
    
    C --> F[📦 Browse Products]
    D --> G[🔐 POST /api/users/login]
    E --> G
    
    G --> H[🎟️ Get JWT Token]
    H --> F
    F --> I[🛒 Cart Management]
    
    subgraph "Cart Operations"
        I --> J[GET /api/carts]
        J -->|Guest| K[🎟️ Get Guest Token]
        J -->|User| L[👤 User Cart]
        K --> M[POST /api/carts/items]
        L --> M
        M --> N[PUT /api/carts/items/:id]
        N --> O[DELETE /api/carts/items/:id]
    end
    
    O --> P[🎫 Apply Promotions]
    P --> Q[POST /api/promos/apply]
    Q --> R[📋 Create Order]
    R --> S[POST /api/orders]
    S --> T[✅ Order Confirmation]
    
    subgraph "Admin Operations"
        E --> U[📦 Manage Products]
        E --> V[🎫 Manage Promos]
        E --> W[📋 Manage Orders]
        E --> X[👥 Manage Users]
        
        U --> U1[POST /api/products]
        U --> U2[PUT /api/products/:id]
        U --> U3[DELETE /api/products/:id]
        
        V --> V1[POST /api/promos]
        V --> V2[PUT /api/promos/:id]
        V --> V3[DELETE /api/promos/:id]
        
        W --> W1[GET /api/orders - All Orders]
        W --> W2[PATCH /api/orders/:id/status]
        
        X --> X1[POST /api/users]
        X --> X2[PUT /api/users/:id]
        X --> X3[DELETE /api/users/:id]
    end
```

## 🛍️ User Journey Flows

### 🎭 Guest Shopping Flow (No Registration Required)

#### **1. Product Discovery**
```http
GET /api/products
```
- Browse product catalog with filtering and pagination
- Search by name, category, price range
- View product details, variants (sizes/colors), pricing
- Check stock availability
- **No authentication needed**

#### **2. Cart Creation**
```http
GET /api/carts
```
- System automatically creates guest cart
- Returns guest token in `X-Guest-Token` header
- Token persists cart across browser sessions
- Cart expires after configurable time period

#### **3. Add Products to Cart**
```http
POST /api/carts/items
Authorization: Bearer <guest-token>
Content-Type: application/json

{
  "variantId": "64f7b1c2e4b0c1d2e3f4g5h7",
  "quantity": 2
}
```
- Select specific product variants
- Automatic quantity and total calculations
- Real-time stock validation

#### **4. Cart Management**
```http
# Update item quantity
PUT /api/carts/items/:itemId
Authorization: Bearer <guest-token>

# Remove item from cart
DELETE /api/carts/items/:itemId
Authorization: Bearer <guest-token>

# Clear entire cart
POST /api/carts/clear
Authorization: Bearer <guest-token>
```

#### **5. Apply Promotions**
```http
POST /api/promos/apply
Authorization: Bearer <guest-token>
Content-Type: application/json

{
  "promoCode": "WELCOME10"
}
```
- Validate promo code
- Check minimum order requirements
- Apply discount calculations
- Show savings breakdown

#### **6. Checkout & Order Creation**
```http
POST /api/orders
Authorization: Bearer <guest-token>
Content-Type: application/json

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
- Convert cart to order
- Capture customer information
- Generate unique order number
- Send order confirmation

### 👤 Registered User Flow

#### **1. User Authentication**
```http
# Login
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userpassword"
}

# Register (Optional)
POST /api/users/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "newpassword",
  "name": "New User"
}
```

#### **2. Cart Management with User Account**
```http
GET /api/carts
Authorization: Bearer <jwt-token>
```
- Persistent cart across devices
- Linked to user account
- Cart survives browser sessions

#### **3. Order History**
```http
GET /api/orders
Authorization: Bearer <jwt-token>
```
- View past orders
- Track order status
- Access order details

### 👑 Admin Management Flow

#### **1. Admin Authentication**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```
- Admin users receive JWT with ADMIN role
- Access to all management endpoints

#### **2. Product Management**
```http
# Create Product
POST /api/products
Authorization: Bearer <admin-jwt>

# Update Product
PUT /api/products/:id
Authorization: Bearer <admin-jwt>

# Delete Product
DELETE /api/products/:id
Authorization: Bearer <admin-jwt>

# Get All Products (including inactive)
GET /api/products
Authorization: Bearer <admin-jwt>
```

#### **3. Promotion Management**
```http
# Create Promotion
POST /api/promos
Authorization: Bearer <admin-jwt>

# Update Promotion
PUT /api/promos/:id
Authorization: Bearer <admin-jwt>

# View All Promotions
GET /api/promos
Authorization: Bearer <admin-jwt>
```

#### **4. Order Management**
```http
# View All Orders
GET /api/orders
Authorization: Bearer <admin-jwt>

# Update Order Status
PATCH /api/orders/:id/status
Authorization: Bearer <admin-jwt>

{
  "status": "SHIPPED"
}
```

#### **5. User Management**
```http
# Create User
POST /api/users
Authorization: Bearer <admin-jwt>

# Update User
PUT /api/users/:id
Authorization: Bearer <admin-jwt>

# Delete User
DELETE /api/users/:id
Authorization: Bearer <admin-jwt>

# Get All Users
GET /api/users
Authorization: Bearer <admin-jwt>
```

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| `POST` | `/api/users/login` | User login - get JWT token | Public |
| `POST` | `/api/users/register` | User registration | Public |
| `GET` | `/api/users/me` | Get current user profile | User/Admin |

### 📦 Product Endpoints

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| `GET` | `/api/products` | Browse products with filters | Public |
| `GET` | `/api/products/:id` | Get product by ID | Public |
| `GET` | `/api/products/slug/:slug` | Get product by slug | Public |
| `POST` | `/api/products` | Create new product | Admin |
| `PUT` | `/api/products/:id` | Update product | Admin |
| `DELETE` | `/api/products/:id` | Delete product | Admin |

### 🛒 Cart Endpoints

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| `GET` | `/api/carts` | Get or create cart | Guest/User |
| `POST` | `/api/carts/items` | Add item to cart | Guest/User |
| `PUT` | `/api/carts/items/:itemId` | Update cart item | Guest/User |
| `DELETE` | `/api/carts/items/:itemId` | Remove cart item | Guest/User |
| `POST` | `/api/carts/clear` | Clear entire cart | Guest/User |

### 🎫 Promotion Endpoints

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| `GET` | `/api/promos` | List active promotions | Public |
| `POST` | `/api/promos/apply` | Apply promo to cart | Guest/User |
| `GET` | `/api/promos/:code/validate` | Validate promo code | Public |
| `POST` | `/api/promos` | Create promotion | Admin |
| `PUT` | `/api/promos/:id` | Update promotion | Admin |
| `DELETE` | `/api/promos/:id` | Delete promotion | Admin |

### 📋 Order Endpoints

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| `POST` | `/api/orders` | Create order from cart | Guest/User |
| `GET` | `/api/orders` | Get user's orders (or all for admin) | User/Admin |
| `GET` | `/api/orders/:id` | Get order details | User/Admin |
| `GET` | `/api/orders/number/:orderNumber` | Get order by number | Guest/User |
| `PATCH` | `/api/orders/:id/status` | Update order status | Admin |

### 👥 User Management Endpoints

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| `GET` | `/api/users` | Get all users | Admin |
| `GET` | `/api/users/:id` | Get user by ID | Admin |
| `POST` | `/api/users` | Create new user | Admin |
| `PUT` | `/api/users/:id` | Update user | Admin |
| `DELETE` | `/api/users/:id` | Delete user | Admin |

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Git for version control

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
   JWT_SECRET="your-super-secret-jwt-key-here"
   
   # Server
   PORT=3000
   NODE_ENV=development
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
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

6. **Access the API**
   - API Base URL: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api-docs
   - Prisma Studio: `npm run prisma:studio`

## 🎯 Sample Data (After Seeding)

### **Test Users**
- **Admin**: `admin@example.com` / `admin123`
- **User**: `john@example.com` / `john123`

### **Sample Products**
- Classic T-Shirt (Multiple sizes/colors) - $19.99
- Wireless Headphones (Black/White) - $129.99
- Coffee Mug (Various colors) - $12.99
- Smartphone Case (iPhone/Samsung) - $22.99-$24.99
- Running Shoes (Multiple sizes/colors) - $89.99

### **Active Promo Codes**
- `WELCOME10` - 10% off orders over $50 (max $20 discount)
- `SAVE20` - $20 off orders over $100
- `SUMMER25` - 25% off orders over $75 (max $50 discount)
- `FREESHIP` - $9.99 off orders over $25

## 🔒 Security Features

- **Input Validation**: Zod schemas for all endpoints
- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control (USER/ADMIN)
- **Guest Security**: Secure UUID tokens for cart sessions
- **Rate Limiting**: Protection against abuse
- **CORS**: Configurable cross-origin policies
- **Error Handling**: Consistent error responses

## 📊 Key Features

### **Guest-First Approach**
- Shopping without registration
- Secure guest tokens
- Cart persistence across sessions

### **Flexible Product System**
- Products with multiple variants
- Inventory management
- Category and search support

### **Smart Promotion Engine**
- Percentage and fixed discounts
- Minimum order requirements
- Usage limits and expiration

### **Robust Order System**
- Guest and user orders
- Status tracking
- Customer information capture

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- products.test.js
```

## 📈 Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build Commands
```bash
npm ci --only=production
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- **Documentation**: http://localhost:3000/api-docs
- **Issues**: GitHub Issues
- **Email**: Support contact information

---

**This headless e-commerce backend provides everything needed to power modern shopping experiences - from guest browsing to admin management, built with performance, security, and developer experience in mind.** 🛍️
