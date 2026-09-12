import { Supplier } from "@/domain/entities/Supplier";
import { SupplierRepository } from "@/domain/repositories/SupplierRepository";
import { TransactionContext } from "@/domain/repositories/Transaction";
import { SupplierMapper } from "@/infrastructure/mappers/Supplier.Mappers";
import { prisma } from "@/infrastructure/prismaClient";
import { dbClient } from "@/infrastructure/database/TransactionManager";
import { BusinessRuleError, NotFoundError } from "@/domain/errors";

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

  async create(supplier: Supplier, tx?: TransactionContext): Promise<void> {
    const db = dbClient(tx);

    const existingEmail = await db.supplier.findFirst({ where: { email: supplier.email } });
    if (existingEmail) throw new BusinessRuleError("Já existe um fornecedor com este e-mail");

    const existingCNPJ = await db.supplier.findUnique({ where: { cnpj: supplier.cnpj } });
    if (existingCNPJ) throw new BusinessRuleError("Já existe um fornecedor com este CNPJ");

    await db.supplier.create({ data: SupplierMapper.toPrisma(supplier) });
  }

  async update(supplier: Supplier): Promise<void> {
    const existing = await prisma.supplier.findFirst({
      where: { email: supplier.email, id: { not: supplier.id }, deletedAt: null },
    });
    if (existing) throw new BusinessRuleError("Já existe um fornecedor com este e-mail");

    const result = await prisma.supplier.updateMany({
      where: { id: supplier.id, deletedAt: null },
      data: SupplierMapper.toPrisma(supplier),
    });
    if (result.count === 0) throw new NotFoundError("Fornecedor não encontrado");
  }

  async softDelete(id: string): Promise<void> {
    const result = await prisma.supplier.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) throw new NotFoundError("Fornecedor não encontrado");
  }
}
