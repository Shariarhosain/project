import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  try {
    // Create sample users with roles and passwords
    const users = [
      {
        email: 'admin@example.com',
        name: 'Admin User',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN' as const,
      },
      {
        email: 'john@example.com',
        name: 'John Doe',
        password: await bcrypt.hash('john123', 10),
        role: 'USER' as const,
      },
      {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: await bcrypt.hash('jane123', 10),
        role: 'USER' as const,
      }
    ];
    
    let userCount = 0;
    for (const userData of users) {
      try {
        const existingUser = await prisma.user.findFirst({
          where: { email: userData.email }
        });
        
        if (!existingUser) {
          await prisma.user.create({
            data: userData
          });
          userCount++;
          console.log(`👤 Created user: ${userData.email} (${userData.role})`);
        } else {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        }
      } catch (error: any) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }

    // Create sample products with variants using Prisma
    const productsData = [
      {
        name: 'Classic T-Shirt',
        description: 'A comfortable cotton t-shirt perfect for everyday wear',
        slug: 'classic-t-shirt',
        category: 'Clothing',
        images: [
          'https://example.com/images/t-shirt-1.jpg',
          'https://example.com/images/t-shirt-2.jpg',
        ],
        status: 'ACTIVE' as const,
        variants: [
          {
            name: 'Small - Black',
            sku: 'TSH-BLK-S',
            price: 19.99,
            inventory: 50,
            attributes: { size: 'S', color: 'Black' },
          },
          {
            name: 'Medium - Black',
            sku: 'TSH-BLK-M',
            price: 19.99,
            inventory: 75,
            attributes: { size: 'M', color: 'Black' },
          },
          {
            name: 'Large - Black',
            sku: 'TSH-BLK-L',
            price: 19.99,
            inventory: 60,
            attributes: { size: 'L', color: 'Black' },
          },
          {
            name: 'Small - White',
            sku: 'TSH-WHT-S',
            price: 19.99,
            inventory: 40,
            attributes: { size: 'S', color: 'White' },
          },
          {
            name: 'Medium - White',
            sku: 'TSH-WHT-M',
            price: 19.99,
            inventory: 80,
            attributes: { size: 'M', color: 'White' },
          },
        ],
      },
      {
        name: 'Premium Hoodie',
        description: 'A warm and cozy hoodie made from premium materials',
        slug: 'premium-hoodie',
        category: 'Clothing',
        images: [
          'https://example.com/images/hoodie-1.jpg',
          'https://example.com/images/hoodie-2.jpg',
        ],
        status: 'ACTIVE' as const,
        variants: [
          {
            name: 'Small - Gray',
            sku: 'HOD-GRY-S',
            price: 49.99,
            inventory: 30,
            attributes: { size: 'S', color: 'Gray' },
          },
          {
            name: 'Medium - Gray',
            sku: 'HOD-GRY-M',
            price: 49.99,
            inventory: 45,
            attributes: { size: 'M', color: 'Gray' },
          },
          {
            name: 'Large - Gray',
            sku: 'HOD-GRY-L',
            price: 49.99,
            inventory: 35,
            attributes: { size: 'L', color: 'Gray' },
          },
          {
            name: 'Medium - Navy',
            sku: 'HOD-NVY-M',
            price: 49.99,
            inventory: 25,
            attributes: { size: 'M', color: 'Navy' },
          },
        ],
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        slug: 'wireless-headphones',
        category: 'Electronics',
        images: [
          'https://example.com/images/headphones-1.jpg',
          'https://example.com/images/headphones-2.jpg',
        ],
        status: 'ACTIVE' as const,
        variants: [
          {
            name: 'Black',
            sku: 'WH-BLK',
            price: 129.99,
            inventory: 20,
            attributes: { color: 'Black' },
          },
          {
            name: 'White',
            sku: 'WH-WHT',
            price: 129.99,
            inventory: 15,
            attributes: { color: 'White' },
          },
        ],
      },
      {
        name: 'Coffee Mug',
        description: 'A ceramic coffee mug perfect for your morning brew',
        slug: 'coffee-mug',
        category: 'Home & Kitchen',
        images: [
          'https://example.com/images/mug-1.jpg',
        ],
        status: 'ACTIVE' as const,
        variants: [
          {
            name: 'Standard - White',
            sku: 'MUG-WHT',
            price: 12.99,
            inventory: 100,
            attributes: { color: 'White', material: 'Ceramic' },
          },
          {
            name: 'Standard - Blue',
            sku: 'MUG-BLU',
            price: 12.99,
            inventory: 80,
            attributes: { color: 'Blue', material: 'Ceramic' },
          },
        ],
      },
      {
        name: 'Smartphone Case',
        description: 'Protective smartphone case with shock absorption',
        slug: 'smartphone-case',
        category: 'Electronics',
        images: [
          'https://example.com/images/case-1.jpg',
        ],
        status: 'ACTIVE' as const,
        variants: [
          {
            name: 'iPhone 14 - Clear',
            sku: 'CASE-IP14-CLR',
            price: 24.99,
            inventory: 50,
            attributes: { model: 'iPhone 14', color: 'Clear' },
          },
          {
            name: 'iPhone 14 - Black',
            sku: 'CASE-IP14-BLK',
            price: 24.99,
            inventory: 60,
            attributes: { model: 'iPhone 14', color: 'Black' },
          },
          {
            name: 'Samsung Galaxy S23 - Clear',
            sku: 'CASE-SGS23-CLR',
            price: 22.99,
            inventory: 40,
            attributes: { model: 'Samsung Galaxy S23', color: 'Clear' },
          },
        ],
      },
    ];

    let productCount = 0;
    let variantCount = 0;

    // Create products and variants using Prisma
    for (const productData of productsData) {
      const { variants, ...product } = productData;
      
      try {
        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
          where: { slug: product.slug }
        });
        
        if (!existingProduct) {
          // Create product with variants
          const createdProduct = await prisma.product.create({
            data: {
              ...product,
              variants: {
                create: variants
              }
            },
            include: {
              variants: true
            }
          });
          
          productCount++;
          variantCount += createdProduct.variants.length;
          console.log(`📦 Created product: ${product.name} with ${createdProduct.variants.length} variants`);
        } else {
          console.log(`⚠️  Product ${product.name} already exists, skipping...`);
        }
      } catch (error: any) {
        console.error(`❌ Failed to create product ${product.name}:`, error.message);
      }
    }

    // Create sample promos using Prisma
    const promosData = [
      {
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: '10% off your first order',
        type: 'PERCENTAGE' as const,
        value: 10,
        minAmount: 50,
        maxDiscount: 20,
        usageLimit: 100,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'ACTIVE' as const,
      },
      {
        code: 'SAVE20',
        name: 'Save $20',
        description: '$20 off orders over $100',
        type: 'FIXED' as const,
        value: 20,
        minAmount: 100,
        usageLimit: 50,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'ACTIVE' as const,
      },
      {
        code: 'SUMMER25',
        name: 'Summer Sale',
        description: '25% off summer collection',
        type: 'PERCENTAGE' as const,
        value: 25,
        minAmount: 75,
        maxDiscount: 50,
        usageLimit: 200,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        status: 'ACTIVE' as const,
      },
      {
        code: 'FREESHIP',
        name: 'Free Shipping',
        description: 'Free shipping on any order',
        type: 'FIXED' as const,
        value: 9.99,
        minAmount: 25,
        usageLimit: 1000,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        status: 'ACTIVE' as const,
      },
      {
        code: 'EXPIRED',
        name: 'Expired Promo',
        description: 'This promo has expired',
        type: 'PERCENTAGE' as const,
        value: 50,
        validFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        validTo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        status: 'EXPIRED' as const,
      },
    ];
    
    let promoCount = 0;
    for (const promoData of promosData) {
      try {
        const existingPromo = await prisma.promo.findUnique({
          where: { code: promoData.code }
        });
        
        if (!existingPromo) {
          await prisma.promo.create({
            data: promoData
          });
          promoCount++;
          console.log(`🎫 Created promo: ${promoData.code}`);
        } else {
          console.log(`⚠️  Promo ${promoData.code} already exists, skipping...`);
        }
      } catch (error: any) {
        console.error(`❌ Failed to create promo ${promoData.code}:`, error.message);
      }
    }

    console.log('✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${userCount} (including 1 admin)`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Product Variants: ${variantCount}`);
    console.log(`- Promo Codes: ${promoCount}`);
    console.log('\n🎯 Test with these credentials:');
    console.log('- Admin: admin@example.com / admin123 (role: ADMIN)');
    console.log('- User: john@example.com / john123 (role: USER)');
    console.log('- User: jane@example.com / jane123 (role: USER)');
    console.log('\n🎫 Test with these promo codes:');
    console.log('- WELCOME10 (10% off, min $50)');
    console.log('- SAVE20 ($20 off, min $100)');
    console.log('- SUMMER25 (25% off, min $75)');
    console.log('- FREESHIP ($9.99 off, min $25)');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    // No need to close client as we're using Prisma
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
