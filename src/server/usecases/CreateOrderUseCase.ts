import { Order } from "@/domain/entities/Order";
import { OrderItem } from "@/domain/entities/OrderItem";
import { OrderStatus } from "@/domain/enums/OrderStatus";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { OrderRepository } from "@/domain/repositories/OrderReposutory";
import { CustomerRepository } from "@/domain/repositories/CustomerRepository";
import { TransactionManager } from "@/domain/repositories/Transaction";
import { NotFoundError, BusinessRuleError } from "@/domain/errors";
import { QuoteFreteUseCase } from "./QuoteFreteUseCase";

interface CreateOrderInput {
  /** Vem sempre da sessão, nunca do corpo da requisição. */
  customerId: string;
  supplierId: string;
  items: { productId: string; quantidade: number }[];
}

export class CreateOrderUseCase {
  constructor(
    private productRepository: ProductRepository,
    private orderRepository: OrderRepository,
    private customerRepository: CustomerRepository,
    private transactionManager: TransactionManager,
    private quoteFrete: QuoteFreteUseCase
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const { customerId, supplierId } = input;

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new NotFoundError("Cliente não encontrado");

    // Mesmo produto repetido no carrinho vira uma linha só; sem isso a
    // conferência de quantidade de produtos abaixo daria falso negativo.
    const items = this.mergeItems(input.items);
    if (items.length === 0) throw new BusinessRuleError("Pedido deve ter pelo menos um item");

    const products = await this.productRepository.findByIds(items.map((i) => i.productId));
    if (products.length !== items.length) {
      throw new NotFoundError("Um ou mais produtos não foram encontrados");
    }

    // Um pedido pertence a um único fornecedor: impede anexar produto barato
    // de outro fornecedor a um pedido declarado para este.
    const forasteiro = products.find((p) => p.supplierId !== supplierId);
    if (forasteiro) {
      throw new BusinessRuleError("Todos os produtos devem ser do mesmo fornecedor do pedido");
    }

    // Frete calculado no servidor a partir do CEP do cliente.
    const frete = await this.quoteFrete.valorPara(customer.cep, supplierId);

    const order = new Order(
      crypto.randomUUID(),
      0,
      frete,
      OrderStatus.PENDING,
      customerId,
      supplierId,
      new Date(),
      new Date()
    );

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      order.addItem(
        new OrderItem(
          crypto.randomUUID(),
          order.id,
          product.id,
          product,
          item.quantidade,
          Number(product.preco)
        )
      );
    }

    order.validate();
    order.calcularTotal();

    return this.transactionManager.execute(async (tx) => {
      // Sequencial de propósito: o Prisma não garante ordem nem isolamento
      // para chamadas disparadas em paralelo dentro da mesma transação.
      for (const item of order.getItems()) {
        await this.productRepository.descrementStock(item.productId, item.quantidade, tx);
      }
      await this.orderRepository.create(order, tx);
      return order;
    });
  }

  private mergeItems(items: CreateOrderInput["items"]) {
    const merged = new Map<string, number>();
    for (const item of items) {
      merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantidade);
    }
    return [...merged].map(([productId, quantidade]) => ({ productId, quantidade }));
  }
}
