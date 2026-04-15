import { Product } from "./Product";

export class OrderItem {
  constructor(
    public id: string,
    public orderId: string,
    public productId: string,
    public product: Product,
    public quantidade: number,
    public precoUnitario: number,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null
  ) {
    this.validate();
  }

  private validate() {
    if (this.quantidade <= 0) throw new Error("Quantidade deve ser maior que zero");
    if (this.precoUnitario < 0) throw new Error("Preço unitário não pode ser negativo");
  }

  get subtotal(): number {
    return this.quantidade * this.precoUnitario;
  }
}
