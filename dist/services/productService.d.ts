import { CreateProductInput, UpdateProductInput, ProductQueryInput } from '../schemas/validation';
export declare class ProductService {
    createProduct(data: CreateProductInput): Promise<{
        variants: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            price: number;
            inventory: number;
            attributes: import("@prisma/client/runtime/library").JsonValue | null;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        category: string;
        status: import(".prisma/client").$Enums.ProductStatus;
        description: string | null;
        images: string[];
    }>;
    getProducts(query: ProductQueryInput): Promise<{
        products: ({
            variants: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string;
                price: number;
                inventory: number;
                attributes: import("@prisma/client/runtime/library").JsonValue | null;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            category: string;
            status: import(".prisma/client").$Enums.ProductStatus;
            description: string | null;
            images: string[];
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProductById(id: string): Promise<{
        variants: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            price: number;
            inventory: number;
            attributes: import("@prisma/client/runtime/library").JsonValue | null;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        category: string;
        status: import(".prisma/client").$Enums.ProductStatus;
        description: string | null;
        images: string[];
    }>;
    getProductBySlug(slug: string): Promise<{
        variants: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            price: number;
            inventory: number;
            attributes: import("@prisma/client/runtime/library").JsonValue | null;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        category: string;
        status: import(".prisma/client").$Enums.ProductStatus;
        description: string | null;
        images: string[];
    }>;
    updateProduct(id: string, data: UpdateProductInput): Promise<{
        variants: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            price: number;
            inventory: number;
            attributes: import("@prisma/client/runtime/library").JsonValue | null;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        category: string;
        status: import(".prisma/client").$Enums.ProductStatus;
        description: string | null;
        images: string[];
    }>;
    deleteProduct(id: string): Promise<void>;
    addVariant(productId: string, variantData: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        price: number;
        inventory: number;
        attributes: import("@prisma/client/runtime/library").JsonValue | null;
        productId: string;
    }>;
    updateVariant(variantId: string, variantData: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        price: number;
        inventory: number;
        attributes: import("@prisma/client/runtime/library").JsonValue | null;
        productId: string;
    }>;
}
declare const _default: ProductService;
export default _default;
//# sourceMappingURL=productService.d.ts.map