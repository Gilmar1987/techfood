import { OrderRepository } from "@/domain/repositories/OrderReposutory";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { TransactionManager } from "@/domain/repositories/Transaction";
import { OrderAccessPolicy } from "@/domain/services/OrderAccessPolicy";
import { Actor } from "@/domain/entities/user";
import { NotFoundError } from "@/domain/errors";

export class UpdateOrderStatusUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private transactionManager: TransactionManager
  ) {}

  /** Avançar o preparo é ação do fornecedor do pedido. */
  async advance(orderId: string, actor: Actor): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Pedido não encontrado");

    if (!OrderAccessPolicy.canAdvance(order, actor)) {
      throw new NotFoundError("Pedido não encontrado");
    }

    order.avancarStatus();
    await this.orderRepository.update(order);
  }

  /** Cancelar pode partir das duas pontas; devolve o estoque reservado. */
  async cancel(orderId: string, actor: Actor): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Pedido não encontrado");

    if (!OrderAccessPolicy.canCancel(order, actor)) {
      throw new NotFoundError("Pedido não encontrado");
    }

    order.cancelar();

    await this.transactionManager.execute(async (tx) => {
      await this.orderRepository.update(order, tx);
      for (const item of order.getItems()) {
        await this.productRepository.increaseStock(item.productId, item.quantidade, tx);
      }
    });
  }
}
