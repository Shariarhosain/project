import { PrismaClient } from '@prisma/client';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');


  // Use direct MongoDB connection to bypass replica set requirement
  const client = new MongoClient(process.env.DATABASE_URL!);
  
  try {
    await client.connect();
    const db = client.db('ecommerce');

    // Create sample users individually
    let userCount = 0;
    const users = [
      {
        email: 'john@example.com',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'jane@example.com',
        name: 'Jane Smith',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    for (const user of users) {
      try {
        await db.collection('users').insertOne(user);
        userCount++;
        console.log(`👤 Created user: ${user.email}`);
      } catch (error: any) {
        if (error.code === 11000) {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // Create sample products with variants
    const products = [
      {
        name: 'Classic T-Shirt',
        description: 'A comfortable cotton t-shirt perfect for everyday wear',
        slug: 'classic-t-shirt',
        category: 'Clothing',
        images: [
          'https://example.com/images/t-shirt-1.jpg',
          'https://example.com/images/t-shirt-2.jpg',
        ],
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [
          {
            name: 'Small - Black',
            sku: 'TSH-BLK-S',
            price: 19.99,
            inventory: 50,
            attributes: { size: 'S', color: 'Black' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Medium - Black',
            sku: 'TSH-BLK-M',
            price: 19.99,
            inventory: 75,
            attributes: { size: 'M', color: 'Black' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Large - Black',
            sku: 'TSH-BLK-L',
            price: 19.99,
            inventory: 60,
            attributes: { size: 'L', color: 'Black' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Small - White',
            sku: 'TSH-WHT-S',
            price: 19.99,
            inventory: 40,
            attributes: { size: 'S', color: 'White' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Medium - White',
            sku: 'TSH-WHT-M',
            price: 19.99,
            inventory: 80,
            attributes: { size: 'M', color: 'White' },
            createdAt: new Date(),
            updatedAt: new Date(),
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
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [
          {
            name: 'Small - Gray',
            sku: 'HOD-GRY-S',
            price: 49.99,
            inventory: 30,
            attributes: { size: 'S', color: 'Gray' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Medium - Gray',
            sku: 'HOD-GRY-M',
            price: 49.99,
            inventory: 45,
            attributes: { size: 'M', color: 'Gray' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Large - Gray',
            sku: 'HOD-GRY-L',
            price: 49.99,
            inventory: 35,
            attributes: { size: 'L', color: 'Gray' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Medium - Navy',
            sku: 'HOD-NVY-M',
            price: 49.99,
            inventory: 25,
            attributes: { size: 'M', color: 'Navy' },
            createdAt: new Date(),
            updatedAt: new Date(),
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
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [
          {
            name: 'Black',
            sku: 'WH-BLK',
            price: 129.99,
            inventory: 20,
            attributes: { color: 'Black' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'White',
            sku: 'WH-WHT',
            price: 129.99,
            inventory: 15,
            attributes: { color: 'White' },
            createdAt: new Date(),
            updatedAt: new Date(),
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
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [
          {
            name: 'Standard - White',
            sku: 'MUG-WHT',
            price: 12.99,
            inventory: 100,
            attributes: { color: 'White', material: 'Ceramic' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Standard - Blue',
            sku: 'MUG-BLU',
            price: 12.99,
            inventory: 80,
            attributes: { color: 'Blue', material: 'Ceramic' },
            createdAt: new Date(),
            updatedAt: new Date(),
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
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [
          {
            name: 'iPhone 14 - Clear',
            sku: 'CASE-IP14-CLR',
            price: 24.99,
            inventory: 50,
            attributes: { model: 'iPhone 14', color: 'Clear' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'iPhone 14 - Black',
            sku: 'CASE-IP14-BLK',
            price: 24.99,
            inventory: 60,
            attributes: { model: 'iPhone 14', color: 'Black' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Samsung Galaxy S23 - Clear',
            sku: 'CASE-SGS23-CLR',
            price: 22.99,
            inventory: 40,
            attributes: { model: 'Samsung Galaxy S23', color: 'Clear' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ];

    let productCount = 0;
    let variantCount = 0;

    // Create products and variants using direct MongoDB
    for (const productData of products) {
      const { variants, ...product } = productData;
      
      try {
        // Insert product
        const productResult = await db.collection('products').insertOne(product);
        productCount++;
        console.log(`📦 Created product: ${product.name}`);
        
        // Insert variants for this product
        const variantsWithProductId = variants.map(variant => ({
          ...variant,
          productId: productResult.insertedId,
        }));
        
        const variantResult = await db.collection('product_variants').insertMany(variantsWithProductId);
        variantCount += variantResult.insertedCount;
        
      } catch (error: any) {
        if (error.code === 11000) {
          console.log(`⚠️  Product ${product.name} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // Create sample promos
    const promoData = [
      {
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: '10% off your first order',
        type: 'PERCENTAGE',
        value: 10,
        minAmount: 50,
        maxDiscount: 20,
        usageLimit: 100,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'SAVE20',
        name: 'Save $20',
        description: '$20 off orders over $100',
        type: 'FIXED',
        value: 20,
        minAmount: 100,
        usageLimit: 50,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'SUMMER25',
        name: 'Summer Sale',
        description: '25% off summer collection',
        type: 'PERCENTAGE',
        value: 25,
        minAmount: 75,
        maxDiscount: 50,
        usageLimit: 200,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'FREESHIP',
        name: 'Free Shipping',
        description: 'Free shipping on any order',
        type: 'FIXED',
        value: 9.99,
        minAmount: 25,
        usageLimit: 1000,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'EXPIRED',
        name: 'Expired Promo',
        description: 'This promo has expired',
        type: 'PERCENTAGE',
        value: 50,
        validFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        validTo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        status: 'EXPIRED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    let promoCount = 0;
    for (const promo of promoData) {
      try {
        await db.collection('promos').insertOne(promo);
        promoCount++;
        console.log(`🎫 Created promo: ${promo.code}`);
      } catch (error: any) {
        if (error.code === 11000) {
          console.log(`⚠️  Promo ${promo.code} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Product Variants: ${variantCount}`);
    console.log(`- Promo Codes: ${promoCount}`);
    console.log('\n🎯 Test with these promo codes:');
    console.log('- WELCOME10 (10% off, min $50)');
    console.log('- SAVE20 ($20 off, min $100)');
    console.log('- SUMMER25 (25% off, min $75)');
    console.log('- FREESHIP ($9.99 off, min $25)');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await client.close();
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
