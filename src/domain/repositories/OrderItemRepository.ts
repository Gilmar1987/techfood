import { OrderItem } from "../entities/OrderItem";
import { TransactionClient } from "./ProductRepository";

export interface OrderItemRepository {
  create(orderItem: OrderItem, tx?: TransactionClient): Promise<void>;
  findById(id: string): Promise<OrderItem | null>;
  findAllByOrderId(orderId: string): Promise<OrderItem[]>;
  update(orderItem: OrderItem): Promise<void>;
  softDelete(id: string): Promise<void>;
}