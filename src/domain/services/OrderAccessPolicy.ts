import { Order } from "../entities/Order";
import { Actor, Role } from "../entities/user";

/**
 * Regras de posse de um pedido. Ficam no domínio porque são regra de negócio:
 * quem paga é o cliente, quem avança o preparo é o fornecedor.
 */
export class OrderAccessPolicy {
  static isAdmin(actor: Actor): boolean {
    return actor.role === Role.ADMIN;
  }

  static isCustomerOf(order: Order, actor: Actor): boolean {
    return !!actor.customerId && order.customerId === actor.customerId;
  }

  static isSupplierOf(order: Order, actor: Actor): boolean {
    return !!actor.supplierId && order.supplierId === actor.supplierId;
  }

  /** Pagar: só o cliente dono do pedido (ou admin). */
  static canPay(order: Order, actor: Actor): boolean {
    return this.isAdmin(actor) || this.isCustomerOf(order, actor);
  }

  /** Avançar o preparo/entrega: só o fornecedor do pedido (ou admin). */
  static canAdvance(order: Order, actor: Actor): boolean {
    return this.isAdmin(actor) || this.isSupplierOf(order, actor);
  }

  /** Cancelar: qualquer uma das duas pontas do pedido (ou admin). */
  static canCancel(order: Order, actor: Actor): boolean {
    return (
      this.isAdmin(actor) ||
      this.isCustomerOf(order, actor) ||
      this.isSupplierOf(order, actor)
    );
  }

  /** Ver o pedido: qualquer uma das duas pontas (ou admin). */
  static canView(order: Order, actor: Actor): boolean {
    return this.canCancel(order, actor);
  }
}
