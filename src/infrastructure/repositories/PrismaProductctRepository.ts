import { prisma } from "@/infrastructure/prismaClient";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { Product } from "@/domain/entities/Product";
import { ProductMapper } from "@/infrastructure/mappers/Product.Mappers";


export class PrismaProductRepository implements ProductRepository {
    async findById(id: string): Promise<Product | null> {
        const prismaProduct = await prisma.product.findFirst({
            where: {
                id,
                deletedAt: null
            }

        });

        if (!prismaProduct) {
            return null;
        }
        if (prismaProduct.deletedAt) {
            return null;
        }
        if (prismaProduct.id !== id) {
            return null;
        }
        return prismaProduct ? ProductMapper.toDomain(prismaProduct) : null;
    }

    async findAll(): Promise<Product[]> {
        const prismaProducts = await prisma.product.findMany({ where: { deletedAt: null } });

        if (!prismaProducts) {
            return [];
        }
        return prismaProducts.map(ProductMapper.toDomain);
    }
    async create(product: Product): Promise<void> {
        //verificar se o nome do produto é único
        const existingProduct = await prisma.product.findFirst({
            where: {
                nome: product.nome,
                deletedAt: null
            }
        });
        if (existingProduct) {
            throw new Error(`Product with name ${product.nome} already exists.`);
        }
        try {
            await prisma.product.create({
                data: ProductMapper.toPrisma(product)
            });
        } catch (error) {
            console.error("Error creating product:", error);
            throw new Error("Failed to create product. Please try again.");
        }
    }

    async update(product: Product): Promise<void> {
        //verificar se o nome do produto é único
        const existingProduct = await prisma.product.findFirst({
            where: {
                nome: product.nome,
                id: { not: product.id },
                deletedAt: null
            }
        });
        if (existingProduct) {
            throw new Error(`Product with name ${product.nome} already exists.`);
        }

        const result = await prisma.product.updateMany({
            where: { id: product.id, deletedAt: null },

            data: ProductMapper.toPrisma(product)
        });
        if (result.count === 0) {
            throw new Error(`Product with id ${product.id} not found or has been deleted.`);
        }

    }

    async softDelete(id: string): Promise<void> {
        const existingProduct = await prisma.product.findFirst({
            where: { id }
        });

        if (!existingProduct || existingProduct.deletedAt) {
            throw new Error(`Product with id ${id} not found or has been deleted.`);
        }

        await prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    async descrementStock(productId: string, quantidade: number): Promise<void> {
        const result = await prisma.product.updateMany({
            where: { id: productId, deletedAt: null },
            data: { quantidade: { decrement: quantidade } }
        })
        if (result.count === 0) {
            throw new Error(`Product with id ${productId} not found or has been deleted.`);
        }
    }

    async findByIds(ids: string[]): Promise<Product[]> {
        const prismaProducts = await prisma.product.findMany({
            where: {
                id: { in: ids },
                deletedAt: null
            }
        });
        return prismaProducts.map(ProductMapper.toDomain);
    }



}