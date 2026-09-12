import { OrderItem } from "./OrderItem";
import { OrderStatus, PaymentMethod, STATUS_TRANSITIONS } from "@/domain/enums/OrderStatus";

/**
 * Referência de exibição do cliente no pedido — não é o agregado `Customer`.
 * O pedido só precisa do nome para listagens.
 */
export type OrderCustomerRef = { id: string; nome: string };

export class Order {
  private items: OrderItem[] = [];
  private paymentMethod?: PaymentMethod;
  private paidAt?: Date;

  constructor(
    public id: string,
    public total: number,
    public frete: number,
    private status: OrderStatus,
    public customerId: string,
    public supplierId: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null,
    public customer?: OrderCustomerRef | null,
    paymentMethod?: PaymentMethod,
    paidAt?: Date
  ) {
    this.paymentMethod = paymentMethod;
    this.paidAt = paidAt;
  }

  addItem(item: OrderItem) { this.items.push(item); }

  // Devolve uma cópia: `Object.freeze(this.items)` congelaria o array interno
  // em definitivo e faria qualquer `addItem` posterior lançar TypeError.
  getItems(): ReadonlyArray<OrderItem> { return Object.freeze([...this.items]); }

  get valorTotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get statusOrder() { return this.status; }

  getPaymentMethod() { return this.paymentMethod; }

  getPaidAt() { return this.paidAt; }

  calcularTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  validate() {
    if (this.items.length === 0) throw new Error("Pedido deve ter pelo menos um item");
  }

  markAsPaid(method: PaymentMethod): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error("Pagamento só permitido para pedidos pendentes");
    }
    this.paymentMethod = method;
    this.paidAt = new Date();
    this.status = OrderStatus.PAID;
  }

  avancarStatus(): void {
    // PENDING só transita para CANCELLED, então precisa ser tratado antes da
    // busca genérica — caso contrário a mensagem específica nunca seria emitida.
    if (this.status === OrderStatus.PENDING) {
      throw new Error("Pedido deve ser pago antes de ser preparado");
    }

    const transitions = STATUS_TRANSITIONS[this.status];
    const next = transitions.find((s) => s !== OrderStatus.CANCELLED);

    if (!next) {
      throw new Error(`Pedido com status ${this.status} não pode ser avançado`);
    }

    this.status = next;
  }

  cancelar(): void {
    const transitions = STATUS_TRANSITIONS[this.status];
    if (!transitions.includes(OrderStatus.CANCELLED)) {
      throw new Error(`Pedido com status ${this.status} não pode ser cancelado`);
    }
    this.status = OrderStatus.CANCELLED;
  }

  canBePrepared(): boolean { return this.status === OrderStatus.PAID; }
}
