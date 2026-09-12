import { OrderRepository } from "@/domain/repositories/OrderReposutory";
import { TransactionContext } from "@/domain/repositories/Transaction";
import { PrismaClient } from "@/generated/prisma/client";
import { Order } from "@/domain/entities/Order";
import { OrderItemRepository } from "@/domain/repositories/OrderItemRepository";
import { OrderItem } from "@/domain/entities/OrderItem";
import { OrderMapper } from "@/infrastructure/mappers/Order.Mappers";
import { dbClient } from "@/infrastructure/database/TransactionManager";

export class PrismaOrderRepository implements OrderRepository {
    constructor(
        private prisma: PrismaClient,
        private orderItemRepository: OrderItemRepository
    ) { }

    async create(order: Order, tx?: TransactionContext): Promise<void> {
        const db = dbClient(tx);
        order.validate();
        await db.order.create({ data: OrderMapper.toPrisma(order) });

        if (order.getItems().length) {
            await this.orderItemRepository.createMany(order.getItems() as OrderItem[], tx);
        }
    }

    async findById(id: string): Promise<Order | null> {
        const prismaOrder = await this.prisma.order.findFirst({
            where: { id, deletedAt: null },
            include: {
                items: { where: { deletedAt: null }, include: { product: true } },
                customer: { select: { nome: true } }
            }
        });
        if (!prismaOrder) {
            return null;
        }
        return OrderMapper.toDomain(prismaOrder);
    }

    async findAllByCustomerId(customerId: string): Promise<Order[]> {
        const prismaOrders = await this.prisma.order.findMany({
            where: { customerId, deletedAt: null },
            include: {
                items: { where: { deletedAt: null }, include: { product: true } },
                customer: { select: { nome: true } }
            }
        });
        return prismaOrders.map(OrderMapper.toDomain);
    }

    async findAll(): Promise<Order[]> {
        const prismaOrders = await this.prisma.order.findMany({
            where: { deletedAt: null },
            include: {
                items: { where: { deletedAt: null }, include: { product: true } },
                customer: { select: { nome: true } }
            }
        });
        return prismaOrders.map(OrderMapper.toDomain);
    }

    async findAllBySupplierId(supplierId: string): Promise<Order[]> {
        const prismaOrders = await this.prisma.order.findMany({
            where: { supplierId, deletedAt: null },
            include: {
                items: { where: { deletedAt: null }, include: { product: true } },
                customer: { select: { nome: true } }
            }
        });
        return prismaOrders.map(OrderMapper.toDomain);
    }

    async update(order: Order, tx?: TransactionContext): Promise<void> {
        const db = dbClient(tx);
        await db.order.update({
            where: { id: order.id },
            data: OrderMapper.toPrisma(order)
        });
    }

    async softDelete(id: string): Promise<void> {
        await this.prisma.order.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
