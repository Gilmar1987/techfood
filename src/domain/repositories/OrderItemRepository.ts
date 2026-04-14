import  { OrderItem } from "../entities/OrderItem";

export interface OrderItemRepository {
  
  create(orderItem: OrderItem): Promise<void>;
  findById(id: string): Promise<OrderItem | null>;
  findAllByOrderId(orderId: string): Promise<OrderItem[]>;
  update(orderItem: OrderItem): Promise<void>;
  softDelete(id: string): Promise<void>;

  
}