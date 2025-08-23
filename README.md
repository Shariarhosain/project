# Headless E-commerce Backend

A comprehensive headless e-commerce backend built with Node.js, Express, TypeScript, Prisma, and MongoDB. This API provides complete functionality for managing products, shopping carts, promotions, and orders.

## 🚀 Features

- **Product Catalog**: Full product management with variants, pricing, and inventory
- **Guest Cart System**: Cart management with guest tokens (no registration required)
- **Promotions**: Flexible promo system with percentage and fixed discounts
- **Order Management**: Complete order processing from cart to fulfillment
- **Input Validation**: Comprehensive validation using Zod
- **API Documentation**: Interactive OpenAPI/Swagger documentation
- **Database**: MongoDB with Prisma ORM
- **Testing**: Jest test suite with API testing
- **TypeScript**: Full TypeScript support for type safety

## 🛠️ Tech Stack

- **Runtime**: Node.js LTS
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ORM**: Prisma
- **Validation**: Zod
- **Documentation**: OpenAPI/Swagger
- **Testing**: Jest + Supertest
- **Authentication**: JWT (for guest tokens)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your MongoDB connection string:
   ```
   DATABASE_URL="mongodb://your-connection-string"
   JWT_SECRET="your-jwt-secret"
   PORT=3000
   ```

4. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

5. **Push database schema**
   ```bash
   npm run prisma:push
   ```

6. **Seed the database**
   ```bash
   npm run prisma:seed
   ```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

## 🔗 API Endpoints

### Products
- `GET /api/products` - Get all products (with pagination, filtering)
- `POST /api/products` - Create a new product
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart (Guest-first)
- `GET /api/carts` - Get or create cart
- `POST /api/carts/items` - Add item to cart
- `PUT /api/carts/items/:itemId` - Update cart item
- `DELETE /api/carts/items/:itemId` - Remove cart item
- `POST /api/carts/clear` - Clear cart

### Promotions
- `GET /api/promos` - Get all promotions
- `POST /api/promos` - Create promotion
- `GET /api/promos/:id` - Get promotion by ID
- `POST /api/promos/apply` - Apply promo to cart
- `PUT /api/promos/:id` - Update promotion
- `DELETE /api/promos/:id` - Delete promotion

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order from cart
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/number/:orderNumber` - Get order by number
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/analytics` - Get order analytics

## 🛒 Guest Cart System

The cart system is designed to work with guest users:

1. **Create/Get Cart**: Make a `GET /api/carts` request to get a new cart with a guest token
2. **Use Token**: Include the guest token in subsequent requests as `Authorization: Bearer <token>`
3. **Cart Persistence**: Carts expire after 30 days
4. **No Registration**: Users can shop without creating accounts

### Example Cart Workflow

```javascript
// 1. Get cart (creates new one if none exists)
const cartResponse = await fetch('/api/carts');
const { guestToken } = cartResponse.json();

// 2. Add items to cart
await fetch('/api/carts/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${guestToken}`
  },
  body: JSON.stringify({
    variantId: 'variant_id_here',
    quantity: 2
  })
});

// 3. Apply promo
await fetch('/api/promos/apply', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${guestToken}`
  },
  body: JSON.stringify({
    promoCode: 'WELCOME10'
  })
});

// 4. Create order
await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${guestToken}`
  },
  body: JSON.stringify({
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'US'
      }
    },
    promoCode: 'WELCOME10'
  })
});
```

## 🎯 Promotion System

The promotion system supports:

- **Percentage Discounts**: e.g., 10% off
- **Fixed Amount Discounts**: e.g., $20 off
- **Minimum Order Amount**: e.g., min $50 order
- **Maximum Discount Cap**: e.g., max $100 discount
- **Usage Limits**: e.g., limited to 100 uses
- **Validity Windows**: Start and end dates
- **Status Management**: Active, Inactive, Expired

### Sample Promo Codes (from seeder)
- `WELCOME10` - 10% off orders over $50 (max $20 discount)
- `SAVE20` - $20 off orders over $100
- `SUMMER25` - 25% off orders over $75 (max $50 discount)
- `FREESHIP` - $9.99 off for orders over $25

## 📊 Database Schema

The application uses MongoDB with the following collections:

- **products** - Product information
- **product_variants** - Product variants (size, color, etc.)
- **carts** - Shopping carts
- **cart_items** - Items in carts
- **promos** - Promotional codes
- **orders** - Customer orders
- **order_items** - Items in orders
- **users** - User accounts (optional)

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Environment Variables
Make sure to set these environment variables in production:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

### Build and Start
```bash
npm run build
npm start
```

## 📈 MongoDB Aggregation Usage

The application uses MongoDB aggregation pipelines for:

- **Cart Totals**: Calculating cart subtotals and item counts
- **Order Analytics**: Revenue calculations and status grouping
- **Inventory Management**: Stock level calculations
- **Promo Usage**: Usage count tracking

Example aggregation in cart service:
```typescript
const result = await prisma.cartItem.aggregate({
  where: { cartId },
  _sum: {
    quantity: true,
  },
});
```

## 🔒 Security Features

- **Input Validation**: All inputs validated with Zod schemas
- **Error Handling**: Centralized error handling with proper status codes
- **Request Logging**: All requests logged with timing
- **CORS Protection**: Configurable CORS policy
- **Helmet**: Security headers with Helmet.js
- **JWT**: Secure token-based authentication for guests

## 🐛 Error Handling

The API uses consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "status": 400,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `410` - Gone (expired cart)
- `500` - Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Happy Shopping! 🛍️**
