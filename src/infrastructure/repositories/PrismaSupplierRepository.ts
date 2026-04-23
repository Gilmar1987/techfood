import { Supplier } from "@/domain/entities/Supplier";
import { SupplierRepository } from "@/domain/repositories/SupplierRepository";
import { SupplierMapper } from "@/infrastructure/mappers/Supplier.Mappers";
import { prisma } from "@/infrastructure/prismaClient";

export class PrismaSupplierRepository implements SupplierRepository {
  async findById(id: string): Promise<Supplier | null> {
    const supplier = await prisma.supplier.findFirst({ where: { id, deletedAt: null } });
    return supplier ? SupplierMapper.toDomain(supplier) : null;
  }

  async findByCNPJ(cnpj: string): Promise<Supplier | null> {
    const supplier = await prisma.supplier.findUnique({ where: { cnpj } });
    if (!supplier || supplier.deletedAt) return null;
    return SupplierMapper.toDomain(supplier);
  }

  async findAll(): Promise<Supplier[]> {
    const suppliers = await prisma.supplier.findMany({ where: { deletedAt: null } });
    return suppliers.map(SupplierMapper.toDomain);
  }

  async create(supplier: Supplier): Promise<void> {
    const existingEmail = await prisma.supplier.findFirst({ where: { email: supplier.email } });
    if (existingEmail) throw new Error("Supplier with this email already exists");

    const existingCNPJ = await prisma.supplier.findUnique({ where: { cnpj: supplier.cnpj } });
    if (existingCNPJ) throw new Error("Supplier with this CNPJ already exists");

    await prisma.supplier.create({ data: SupplierMapper.toPrisma(supplier) });
  }

  async update(supplier: Supplier): Promise<void> {
    const existing = await prisma.supplier.findFirst({
      where: { email: supplier.email, id: { not: supplier.id }, deletedAt: null },
    });
    if (existing) throw new Error("Supplier with this email already exists");

    const result = await prisma.supplier.updateMany({
      where: { id: supplier.id, deletedAt: null },
      data: SupplierMapper.toPrisma(supplier),
    });
    if (result.count === 0) throw new Error("Supplier not found or has been deleted");
  }

  async softDelete(id: string): Promise<void> {
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new Error("Supplier not found");
    await prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
