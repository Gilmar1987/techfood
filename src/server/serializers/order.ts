import { Order } from "@/domain/entities/Order";

/** Forma do pedido exposta pela API. Compartilhada por `/api/orders` e pelo stream SSE. */
export function serializeOrder(order: Order) {
  return {
    id: order.id,
    status: order.statusOrder,
    paymentMethod: order.getPaymentMethod() ?? null,
    paidAt: order.getPaidAt()?.toISOString() ?? null,
    frete: Number(order.frete),
    total: Number(order.valorTotal) + Number(order.frete),
    createdAt: order.createdAt?.toISOString() ?? "",
    customer: order.customer ? { nome: order.customer.nome } : null,
    customerId: order.customerId,
    supplierId: order.supplierId,
    items: order.getItems().map((item) => ({
      id: item.id,
      quantidade: item.quantidade,
      precoUnitario: Number(item.precoUnitario),
      product: { nome: item.product.nome },
    })),
  };
}

export function serializeOrders(orders: Order[]) {
  return orders.map(serializeOrder);
}
