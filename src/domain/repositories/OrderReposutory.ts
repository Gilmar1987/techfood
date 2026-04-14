import { Order } from "../entities/Order";


export interface OrderRepository {
  
  create(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  findAllByCustomerId(customerId: string): Promise<Order[]>;
  update(order: Order): Promise<void>;
  softDelete(id: string): Promise<void>;
  
}