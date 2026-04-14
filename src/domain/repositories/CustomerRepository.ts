import { Customer } from "../entities/Customer";


export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  create(customer: Customer): Promise<void>;
  update(customer: Customer): Promise<void>;
  softDelete(id: string): Promise<void>;
}
