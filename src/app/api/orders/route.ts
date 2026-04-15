import { CreateOrderUseCase } from "@/server/usecases/CreateOrderUseCase";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { OrderRepository } from "@/domain/repositories/OrderRepository";
import { CustomerRepository } from "@/domain/repositories/CustomerRepository";
import { CreateOrderUseCasereateOrderUseCase } from "@/server/usecases/CreateOrderUseCase";

export async function POST (request: Request) {
  const productRepository = new ProductRepository();
  const orderRepository = new OrderRepository();
  const customerRepository = new CustomerRepository();
  try {
    const body = await request.json();
    const createOrderUseCase = new CreateOrderUseCase(productRepository, orderRepository, customerRepository);
    const order = await createOrderUseCase.execute(body);
    return new Response(JSON.stringify(order), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}