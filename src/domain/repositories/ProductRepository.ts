import { Product } from "../entities/Product";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  softDelete(id: string): Promise<void>;
  findByIds(ids: string[]): Promise<Product[]>;
  descrementStock(productId: string, quantity: number): Promise<void>;
}