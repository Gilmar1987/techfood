import { OrderItem } from "@/domain/entities/OrderItem";
import { ProductMapper } from "@/infrastructure/mappers/Product.Mappers";
import { Prisma } from "@/generated/prisma/client";

type OrderItemWithRelations = Prisma.OrderItemGetPayload<{
  include: { product: true }
}>;

export class OrderItemMapper {
  static toDomain(prismaOrderItem: OrderItemWithRelations) {
    return new OrderItem(
      prismaOrderItem.id,
      prismaOrderItem.orderId,
      prismaOrderItem.productId,
      ProductMapper.toDomain(prismaOrderItem.product),
      prismaOrderItem.quantidade,
      Number(prismaOrderItem.precoUnitario),
      prismaOrderItem.createdAt,
      prismaOrderItem.updatedAt,
      prismaOrderItem.deletedAt
    );
  }

  static toPrisma(orderItem: OrderItem) {
    return {
      id: orderItem.id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      quantidade: orderItem.quantidade,
      precoUnitario: orderItem.precoUnitario,
    };
  }
}
