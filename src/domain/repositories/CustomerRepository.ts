import { Customer } from "../entities/Customer";
import { TransactionContext } from "./Transaction";

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  create(customer: Customer, tx?: TransactionContext): Promise<void>;
  update(customer: Customer): Promise<void>;
  softDelete(id: string): Promise<void>;
  findByCPF(cpf: string): Promise<Customer | null>;
}
