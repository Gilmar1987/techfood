import { Supplier } from "@/domain/entities/Supplier";
import { Supplier as PrismaSupplier } from "@/generated/prisma/client";

export class SupplierMapper {
  static toDomain(prismaSupplier: PrismaSupplier): Supplier {
    return new Supplier(
      prismaSupplier.id,
      prismaSupplier.razaoSocial,
      prismaSupplier.cnpj,
      prismaSupplier.cep,
      prismaSupplier.endereco,
      prismaSupplier.telefone,
      prismaSupplier.email,
      prismaSupplier.latitude,
      prismaSupplier.longitude,
      prismaSupplier.createdAt,
      prismaSupplier.updatedAt,
      prismaSupplier.deletedAt
    );
  }

  static toPrisma(supplier: Supplier) {
    return {
      id: supplier.id,
      razaoSocial: supplier.razaoSocial,
      cnpj: supplier.cnpj,
      cep: supplier.cep,
      endereco: supplier.endereco,
      telefone: supplier.telefone,
      email: supplier.email,
      latitude: supplier.latitude,
      longitude: supplier.longitude,
    };
  }
}
