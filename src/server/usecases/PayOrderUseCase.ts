import { OrderRepository } from "@/domain/repositories/OrderReposutory";
import { PaymentMethod } from "@/domain/enums/OrderStatus";
import { OrderAccessPolicy } from "@/domain/services/OrderAccessPolicy";
import { Actor } from "@/domain/entities/user";
import { NotFoundError } from "@/domain/errors";

export class PayOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(orderId: string, paymentMethod: PaymentMethod, actor: Actor): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Pedido não encontrado");

    // Mesma mensagem de "não existe": não confirma a existência do id a quem não é dono.
    if (!OrderAccessPolicy.canPay(order, actor)) {
      throw new NotFoundError("Pedido não encontrado");
    }

    order.markAsPaid(paymentMethod);
    await this.orderRepository.update(order);
  }
}
