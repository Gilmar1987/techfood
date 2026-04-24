import { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { OrderItemRepository } from "@/domain/repositories/OrderItemRepository";
import { OrderItem } from "@/domain/entities/OrderItem";
import { OrderItemMapper } from "@/infrastructure/mappers/OrderItem.Mappers";



export class PrismaOrderItemRepository implements OrderItemRepository {
    constructor(private prisma: PrismaClient) {}

    async createMany(orderItems: OrderItem[], tx?: Prisma.TransactionClient): Promise<void> {
        const db = tx ?? this.prisma;
        await db.orderItem.createMany({
            data: orderItems.map(OrderItemMapper.toPrisma),
        });
    }

    async create(orderItem: OrderItem, tx?: Prisma.TransactionClient): Promise<void> {
        const db = tx ?? this.prisma;
        try {
            await db.orderItem.create({
                data: OrderItemMapper.toPrisma(orderItem)
            });
        } catch (error) {
            console.error("Error creating order item:", error);
            throw new Error("Failed to create order item. Please try again.");
        }
    }
    async update(orderItem: OrderItem): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async findById(id: string): Promise<OrderItem | null> {
        throw new Error("Method not implemented.");
    }
    async findAll(): Promise<OrderItem[]> {
        throw new Error("Method not implemented.");
    }
    
    async findByOrderId(orderId: string): Promise<OrderItem[]> {
        const prismaOrderItems = await this.prisma.orderItem.findMany({
            where: {
                orderId,
                deletedAt: null
            },
            include: {
                product: true
            }
        });
        return prismaOrderItems.map(OrderItemMapper.toDomain);
    }
    async findAllByOrderId(orderId: string): Promise<OrderItem[]> {
        return this.findByOrderId(orderId);
    }
    async softDelete(id: string): Promise<void> {
        await this.prisma.orderItem.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
