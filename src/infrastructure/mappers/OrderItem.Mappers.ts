/*
model OrderItem{
  id            String   @id @default(uuid())
  quantidade    Int
  precoUnitario Decimal  @db.Decimal(10, 2)
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id])
  productId     String
  product       Product  @relation(fields:[productId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  deletedAt   DateTime?

  @@index([deletedAt])
  @@index([orderId])
  @@index([productId])
}
  */
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
      quantidade: orderItem.quantity,
      precoUnitario: orderItem.precoUnitario,
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt,
      deletedAt: orderItem.deletedAt
    };
  }
}
