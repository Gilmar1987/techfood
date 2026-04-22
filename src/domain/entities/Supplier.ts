/*
model Supplier {
  id          String    @id @default(uuid())
  razaoSocial String
  endereco    String
  telefone    String
  email       String    @unique
  latitude    Float
  longitude   Float
  products    Product[]
  orders      Order[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  @@index([deletedAt])
}
  */

// implementação da model Supplier

export class Supplier {
    constructor (
        public id: string,
        public razaoSocial: string,
        public endereco: string,
        public telefone: string,
        public email: string,
        public latitude: number,
        public longitude: number,
        public products: Product[],
        public orders: Order[],
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null,
    )
}