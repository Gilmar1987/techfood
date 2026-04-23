import { Order } from "@/domain/entities/Order";
import { OrderItem } from "@/domain/entities/OrderItem";
import { OrderStatus } from "@/domain/enums/OrderStatus";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { OrderRepository } from "@/domain/repositories/OrderReposutory";
import { CustomerRepository } from "@/domain/repositories/CustomerRepository";
import { TransactionManager } from "@/infrastructure/database/TransactionManager";

interface CreateOrderInput {
  customerId: string;
  supplierId: string;
  frete?: number;
  items: { productId: string; quantidade: number }[];
}

export class CreateOrderUseCase {
  constructor( 
    private productRepository: ProductRepository,
    private orderRepository: OrderRepository,
    private customerRepository: CustomerRepository,
    private transactionManager: TransactionManager
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const { customerId, supplierId, frete = 0, items } = input;

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    const products = await this.productRepository.findByIds(items.map((i) => i.productId));
    if (products.length !== items.length) throw new Error("One or more products not found");

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
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product with id ${item.productId} not found`);

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
      for (const item of order.getItems()) {
        await this.productRepository.descrementStock(item.productId, item.quantidade, tx);
      }
      await this.orderRepository.create(order, tx);
      return order;
    });
  }
}
