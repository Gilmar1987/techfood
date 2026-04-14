
import { Product } from "@/domain/entities/Product";
import { Product as PrismaProduct} from "@/generated/prisma/client";

export class ProductMapper {
  static toDomain(prismaProduct: PrismaProduct): Product {
    return new Product(
      prismaProduct.id,
      prismaProduct.nome,
      Number(prismaProduct.preco),
      prismaProduct.quantidade,
      prismaProduct.createdAt,
      prismaProduct.updatedAt,
      prismaProduct.deletedAt
    );
  }

  static toPrisma(product: Product) {
    return {
      id: product.id,
      nome: product.nome,
      preco: product.preco,
      quantidade: product.quantidade,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt
    };
  }
}



