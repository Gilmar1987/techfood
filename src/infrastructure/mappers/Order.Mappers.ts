import { Order } from "@/domain/entities/Order";
import { OrderStatus, PaymentMethod } from "@/domain/enums/OrderStatus";
import { OrderItemMapper } from "@/infrastructure/mappers/OrderItem.Mappers";

type OrderWithItems = {
  id: string;
  total: any;
  frete: any;
  status: string;
  paymentMethod: string | null;
  paidAt: Date | null;
  customerId: string;
  supplierId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  items?: any[];
  customer?: { nome: string } | null;
};

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
      order.customer ? { id: order.customerId, nome: order.customer.nome } as any : null,
      order.paymentMethod as PaymentMethod | undefined,
      order.paidAt ?? undefined
    );
    if (order.items) {
      order.items.forEach(item => domainOrder.addItem(OrderItemMapper.toDomain(item)));
    }
    return domainOrder;
  }
}
