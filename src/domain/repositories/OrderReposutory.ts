import { Order } from "../entities/Order";
import { TransactionClient } from "./ProductRepository";

export interface OrderRepository {
  create(order: Order, tx?: TransactionClient): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  findAllByCustomerId(customerId: string): Promise<Order[]>;
  findAllBySupplierId(supplierId: string): Promise<Order[]>;
  update(order: Order): Promise<void>;
  softDelete(id: string): Promise<void>;
}