/*model Product{
  id         String @id @default(uuid())
  nome       String
  preco      Decimal @db.Decimal(10, 2)
  quantidade Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?
  orderItems OrderItem[]
}
*/

//Implementação da entidade Product no domínio
export class Product {
  constructor(
    public id: string,
    public nome: string,
    public preco: number,
    public quantidade: number,
    public supplierId: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null
  ) {}
  decreaseStock(amount: number): void {
    if (amount > this.quantidade) {
      throw new Error("Quantidade insuficiente em estoque");
    }
    this.quantidade -= amount;
  }

  increaseStock(amount: number): void {
    this.quantidade += amount;
  }

  // Outros métodos relacionados ao produto podem ser adicionados aqui
  //verificar se o produto já existe, atualizar preço, etc.

  updatePrice(newPrice: number): void {
    this.preco = newPrice;
  }

  
}