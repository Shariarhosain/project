import { prisma } from '../lib/prisma';
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from '../schemas/validation';
import { createError } from '../middleware/errorHandler';

export class ProductService {
  async createProduct(data: CreateProductInput) {
    const { variants, ...productData } = data;
    
    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });
    
    if (existingProduct) {
      throw createError('Product with this slug already exists', 409);
    }
    
    // Check if any SKU already exists
    const existingSku = await prisma.productVariant.findFirst({
      where: {
        sku: { in: variants.map(v => v.sku) },
      },
    });
    
    if (existingSku) {
      throw createError('One or more SKUs already exist', 409);
    }
    
    return await prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants,
        },
      },
      include: {
        variants: true,
      },
    });
  }
  
  async getProducts(query: ProductQueryInput) {
    const { page = 1, limit = 10, category, status, search } = query;
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
    
    return {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
  
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });
    
    if (!product) {
      throw createError('Product not found', 404);
    }
    
    return product;
  }
  
  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
      },
    });
    
    if (!product) {
      throw createError('Product not found', 404);
    }
    
    return product;
  }
  
  async updateProduct(id: string, data: UpdateProductInput) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      throw createError('Product not found', 404);
    }
    
    if (data.slug && data.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: data.slug },
      });
      
      if (slugExists) {
        throw createError('Product with this slug already exists', 409);
      }
    }
    
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        variants: true,
      },
    });
  }
  
  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      throw createError('Product not found', 404);
    }
    
    await prisma.product.delete({
      where: { id },
    });
  }
  
  async addVariant(productId: string, variantData: any) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      throw createError('Product not found', 404);
    }
    
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: variantData.sku },
    });
    
    if (existingSku) {
      throw createError('SKU already exists', 409);
    }
    
    return await prisma.productVariant.create({
      data: {
        ...variantData,
        productId,
      },
    });
  }
  
  async updateVariant(variantId: string, variantData: any) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    
    if (!variant) {
      throw createError('Variant not found', 404);
    }
    
    if (variantData.sku && variantData.sku !== variant.sku) {
      const skuExists = await prisma.productVariant.findUnique({
        where: { sku: variantData.sku },
      });
      
      if (skuExists) {
        throw createError('SKU already exists', 409);
      }
    }
    
    return await prisma.productVariant.update({
      where: { id: variantId },
      data: variantData,
    });
  }
}

export default new ProductService();
