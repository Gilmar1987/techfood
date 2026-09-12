import { Product } from "../entities/Product";
import { TransactionContext } from "./Transaction";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  softDelete(id: string): Promise<void>;
  findByIds(ids: string[]): Promise<Product[]>;
  findBySupplierId(supplierId: string): Promise<Product[]>;
  findByNomeAndSupplier(nome: string, supplierId: string): Promise<Product | null>;
  descrementStock(productId: string, quantidade: number, tx?: TransactionContext): Promise<void>;
  increaseStock(productId: string, quantidade: number, tx?: TransactionContext): Promise<void>;
}
