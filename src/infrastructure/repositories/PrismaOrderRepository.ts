import { OrderRepository } from "@/domain/repositories/OrderReposutory";
import { PrismaClient } from "@/generated/prisma/client";
import { Order } from "@/domain/entities/Order";
import { OrderItemRepository } from "@/domain/repositories/OrderItemRepository";
import { OrderItem } from "@/domain/entities/OrderItem";
import { OrderItemMapper } from "@/infrastructure/mappers/OrderItem.Mappers";
import { OrderMapper } from "@/infrastructure/mappers/Order.Mappers";
import { TransactionManager } from "../database/TransactionManager";
import { Prisma } from "@/generated/prisma/client";

export class PrismaOrderRepository implements OrderRepository {
    constructor(
        private prisma: PrismaClient,
        private orderItemRepository: OrderItemRepository
    ) { }
    async create(order: Order, tx?: Prisma.TransactionClient): Promise<void> {
        const db = tx || this.prisma;
        order.validate();
        await db.order.create({ data: OrderMapper.toPrisma(order) });

        if (order.getItems().length) {
            for (const item of order.getItems()) {
                await this.orderItemRepository.create(item, tx);
            }
        }
    }
    

    async findById(id: string): Promise<Order | null> {
        const prismaOrder = await this.prisma.order.findFirst({
            where: { id, deletedAt: null },
            include: { items: { where: { deletedAt: null }, include: { product: true } } }
        });
        if (!prismaOrder) {
            return null;
        }
        return OrderMapper.toDomain(prismaOrder);
    }

    async findAllByCustomerId(customerId: string): Promise<Order[]> {
        const prismaOrders = await this.prisma.order.findMany({
            where: { customerId, deletedAt: null },
            include: { items: { where: { deletedAt: null }, include: { product: true } } }
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

    async update(order: Order): Promise<void> {
        await this.prisma.order.update({
            where: { id: order.id },
            data: OrderMapper.toPrisma(order)
        });
    }

    async softDelete(id: string): Promise<void>
    {
        await this.prisma.order.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
