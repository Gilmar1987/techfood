import { PrismaClient } from "@/generated/prisma/client";
import { OrderItemRepository } from "@/domain/repositories/OrderItemRepository";
import { TransactionContext } from "@/domain/repositories/Transaction";
import { OrderItem } from "@/domain/entities/OrderItem";
import { OrderItemMapper } from "@/infrastructure/mappers/OrderItem.Mappers";
import { dbClient } from "@/infrastructure/database/TransactionManager";

export class PrismaOrderItemRepository implements OrderItemRepository {
    constructor(private prisma: PrismaClient) {}

    async createMany(orderItems: OrderItem[], tx?: TransactionContext): Promise<void> {
        const db = dbClient(tx);
        await db.orderItem.createMany({
            data: orderItems.map(OrderItemMapper.toPrisma),
        });
    }

    async findAllByOrderId(orderId: string): Promise<OrderItem[]> {
        const prismaOrderItems = await this.prisma.orderItem.findMany({
            where: { orderId, deletedAt: null },
            include: { product: true },
        });
        return prismaOrderItems.map(OrderItemMapper.toDomain);
    }

    async softDelete(id: string): Promise<void> {
        await this.prisma.orderItem.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
