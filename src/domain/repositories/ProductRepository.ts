import { Product } from "../entities/Product";

export interface TransactionClient {
  product: {
    updateMany: (args: any) => Promise<{ count: number }>;
  };
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  softDelete(id: string): Promise<void>;
  findByIds(ids: string[]): Promise<Product[]>;
  descrementStock(productId: string, quantidade: number, tx?: TransactionClient): Promise<void>;
}