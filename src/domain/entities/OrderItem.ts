/*
model OrderItem{
  id            String   @id @default(uuid())
  quantidade    Int
  precoUnitario Decimal  @db.Decimal(10, 2)
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id])
  productId     String
  product       Product  @relation(fields:[productId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  deletedAt   DateTime?

  @@index([deletedAt])
  @@index([orderId])
  @@index([productId])
}
  */

import { Order } from "./Order";
import { Product } from "./Product";

export class OrderItem {
  constructor(
    public id: string,
    public orderId: string,
    public productId: string,
    public product: Product,
    public quantity: number,
    public precoUnitario: number,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null

  ) {
    this.validate();
  }

  private validate() {
    if (this.quantity <= 0) {
      throw new Error("Quantidade deve ser maior que zero");
    }

    if (this.precoUnitario < 0) {
      throw new Error("Preço unitário não pode ser negativo");
    }
  }
  get subtotal(): number {
    return this.quantity * this.precoUnitario;
  }
}
