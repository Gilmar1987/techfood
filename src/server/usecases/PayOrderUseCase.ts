import { OrderRepository } from "@/domain/repositories/OrderReposutory";
import { PaymentMethod } from "@/domain/enums/OrderStatus";

export class PayOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string, paymentMethod: PaymentMethod): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error("Pedido não encontrado");

    order.markAsPaid(paymentMethod);
    await this.orderRepository.update(order);
  }
}
