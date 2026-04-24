import { OrderRepository } from "@/domain/repositories/OrderReposutory";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { TransactionManager } from "@/infrastructure/database/TransactionManager";

export class UpdateOrderStatusUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private transactionManager: TransactionManager
  ) {}

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

    await this.transactionManager.execute(async (tx) => {
      await Promise.all([
        this.orderRepository.update(order, tx),
        ...order.getItems().map((item) =>
          this.productRepository.increaseStock(item.productId, item.quantidade, tx)
        ),
      ]);
    });
  }
}
