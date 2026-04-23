import { OrderRepository } from "@/domain/repositories/OrderReposutory";

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async advance(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error("Pedido não encontrado");

    order.avancarStatus();
    await this.orderRepository.update(order);
  }

  async cancel(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error("Pedido não encontrado");

    order.cancelar();
    await this.orderRepository.update(order);
  }
}
