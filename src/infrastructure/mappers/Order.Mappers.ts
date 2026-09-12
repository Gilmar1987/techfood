import { Order } from "@/domain/entities/Order";
import { OrderStatus, PaymentMethod } from "@/domain/enums/OrderStatus";
import { OrderItemMapper } from "@/infrastructure/mappers/OrderItem.Mappers";
import { Prisma } from "@/generated/prisma/client";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    customer: { select: { nome: true } };
  };
}>;

export class OrderMapper {
  static toPrisma(order: Order) {
    return {
      id: order.id,
      total: order.valorTotal,
      frete: order.frete,
      status: order.statusOrder,
      paymentMethod: order.getPaymentMethod() ?? null,
      paidAt: order.getPaidAt() ?? null,
      customerId: order.customerId,
      supplierId: order.supplierId,
    };
  }

  static toDomain(order: OrderWithItems): Order {
    const domainOrder = new Order(
      order.id,
      Number(order.total),
      Number(order.frete ?? 0),
      order.status as OrderStatus,
      order.customerId,
      order.supplierId,
      order.createdAt,
      order.updatedAt,
      order.deletedAt,
      order.customer ? { id: order.customerId, nome: order.customer.nome } : null,
      (order.paymentMethod as PaymentMethod | null) ?? undefined,
      order.paidAt ?? undefined
    );

    for (const item of order.items ?? []) {
      domainOrder.addItem(OrderItemMapper.toDomain(item));
    }

    return domainOrder;
  }
}
