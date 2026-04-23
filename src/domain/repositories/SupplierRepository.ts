import { Supplier } from "../entities/Supplier";

export interface SupplierRepository {
  findById(id: string): Promise<Supplier | null>;
  findAll(): Promise<Supplier[]>;
  findByCNPJ(cnpj: string): Promise<Supplier | null>;
  create(supplier: Supplier): Promise<void>;
  update(supplier: Supplier): Promise<void>;
  softDelete(id: string): Promise<void>;
}
