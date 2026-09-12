import { OrderItem } from "../entities/OrderItem";
import { TransactionContext } from "./Transaction";

export interface OrderItemRepository {
  createMany(orderItems: OrderItem[], tx?: TransactionContext): Promise<void>;
  findAllByOrderId(orderId: string): Promise<OrderItem[]>;
  softDelete(id: string): Promise<void>;
}
