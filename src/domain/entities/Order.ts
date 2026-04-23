/*
model Order{
  id          String       @id @default(uuid())
  total       Decimal      @db.Decimal(10, 2)
  status      OrderStatus  @default(PENDING)
  customerId  String
  customer    Customer     @relation(fields: [customerId], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?
  items       OrderItem[]

  @@index([deletedAt])
  @@index([customerId])
}
  */

import { Customer } from "./Customer";
import { Product } from "./Product";
import { OrderItem } from "./OrderItem";
import { OrderStatus } from "@/domain/enums/OrderStatus";

export class Order {
  private items: OrderItem[] = [];
  constructor(
    public id: string,
    public total: number,
    private status: OrderStatus,
    public customerId: string,
    public supplierId: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null,
    public customer?: Customer | null
  ) {}
  addItem(item: OrderItem) {
    this.items.push(item);
  }
  getItems(): ReadonlyArray<OrderItem> {
    return Object.freeze(this.items);
  }

  get valorTotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get statusOrder() {
    return this.status;
  }

  calcularTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  validate() {
    if (this.items.length === 0) {
      throw new Error("Pedido deve ter pelo menos um item");
    }
  }
}

