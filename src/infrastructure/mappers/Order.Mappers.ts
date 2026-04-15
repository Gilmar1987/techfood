import { Order } from "@/domain/entities/Order";
import { OrderStatus } from "@/domain/enums/OrderStatus";
import { OrderItemMapper } from "@/infrastructure/mappers/OrderItem.Mappers";

type OrderWithItems = {
  id: string;
  total: any;
  status: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  items?: any[];
};

export class OrderMapper {
  static toPrisma(order: Order) {
    return {
      id: order.id,
      total: order.total,
      status: order.statusOrder,
      customerId: order.customerId,
    };
  }

  static toDomain(order: OrderWithItems): Order {
    const domainOrder = new Order(
      order.id,
      Number(order.total),
      order.status as OrderStatus,
      order.customerId,
      order.createdAt,
      order.updatedAt,
      order.deletedAt
    );
    if (order.items) {
      order.items.forEach(item => domainOrder.addItem(OrderItemMapper.toDomain(item)));
    }
    return domainOrder;
  }
}
