import { prisma } from "@/infrastructure/prismaClient";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { TransactionContext } from "@/domain/repositories/Transaction";
import { Product } from "@/domain/entities/Product";
import { ProductMapper } from "@/infrastructure/mappers/Product.Mappers";
import { dbClient } from "@/infrastructure/database/TransactionManager";
import { BusinessRuleError, NotFoundError } from "@/domain/errors";

export class PrismaProductRepository implements ProductRepository {
    async findById(id: string): Promise<Product | null> {
        const prismaProduct = await prisma.product.findFirst({
            where: { id, deletedAt: null }
        });
        return prismaProduct ? ProductMapper.toDomain(prismaProduct) : null;
    }

    async findAll(): Promise<Product[]> {
        const prismaProducts = await prisma.product.findMany({ where: { deletedAt: null } });
        return prismaProducts.map(ProductMapper.toDomain);
    }

    /** Unicidade de nome é por fornecedor — dois fornecedores podem vender "Pizza". */
    async findByNomeAndSupplier(nome: string, supplierId: string): Promise<Product | null> {
        const prismaProduct = await prisma.product.findFirst({
            where: { nome, supplierId, deletedAt: null }
        });
        return prismaProduct ? ProductMapper.toDomain(prismaProduct) : null;
    }

    async create(product: Product): Promise<void> {
        const existingProduct = await this.findByNomeAndSupplier(product.nome, product.supplierId);
        if (existingProduct) {
            throw new BusinessRuleError(`Já existe um produto seu chamado "${product.nome}".`);
        }
        await prisma.product.create({ data: ProductMapper.toPrisma(product) });
    }

    async update(product: Product): Promise<void> {
        const existingProduct = await prisma.product.findFirst({
            where: {
                nome: product.nome,
                supplierId: product.supplierId,
                id: { not: product.id },
                deletedAt: null
            }
        });
        if (existingProduct) {
            throw new BusinessRuleError(`Já existe um produto seu chamado "${product.nome}".`);
        }

        const result = await prisma.product.updateMany({
            where: { id: product.id, deletedAt: null },
            data: ProductMapper.toPrisma(product)
        });
        if (result.count === 0) {
            throw new NotFoundError("Produto não encontrado");
        }
    }

    async softDelete(id: string): Promise<void> {
        const result = await prisma.product.updateMany({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date() }
        });
        if (result.count === 0) {
            throw new NotFoundError("Produto não encontrado");
        }
    }

    /**
     * O filtro `quantidade: { gte: quantidade }` é o que torna o decremento seguro
     * sob concorrência: duas compras simultâneas do último item, só uma afeta linha.
     */
    async descrementStock(productId: string, quantidade: number, tx?: TransactionContext): Promise<void> {
        const db = dbClient(tx);
        const result = await db.product.updateMany({
            where: { id: productId, deletedAt: null, quantidade: { gte: quantidade } },
            data: { quantidade: { decrement: quantidade } }
        });
        if (result.count === 0) {
            throw new BusinessRuleError("Estoque insuficiente ou produto indisponível.");
        }
    }

    async increaseStock(productId: string, quantidade: number, tx?: TransactionContext): Promise<void> {
        const db = dbClient(tx);
        const result = await db.product.updateMany({
            where: { id: productId, deletedAt: null },
            data: { quantidade: { increment: quantidade } }
        });
        if (result.count === 0) {
            throw new NotFoundError("Produto não encontrado");
        }
    }

    async findByIds(ids: string[]): Promise<Product[]> {
        const prismaProducts = await prisma.product.findMany({
            where: { id: { in: ids }, deletedAt: null }
        });
        return prismaProducts.map(ProductMapper.toDomain);
    }

    async findBySupplierId(supplierId: string): Promise<Product[]> {
        const prismaProducts = await prisma.product.findMany({
            where: { supplierId, deletedAt: null }
        });
        return prismaProducts.map(ProductMapper.toDomain);
    }
}
