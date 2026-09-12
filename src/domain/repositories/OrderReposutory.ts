import { Order } from "../entities/Order";
import { TransactionContext } from "./Transaction";

export interface OrderRepository {
  create(order: Order, tx?: TransactionContext): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  findAllByCustomerId(customerId: string): Promise<Order[]>;
  findAllBySupplierId(supplierId: string): Promise<Order[]>;
  update(order: Order, tx?: TransactionContext): Promise<void>;
  softDelete(id: string): Promise<void>;
}
